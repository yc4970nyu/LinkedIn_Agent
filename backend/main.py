from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import time
import random
import csv 
import traceback
from datetime import datetime
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from openai import OpenAI

load_dotenv()
LINKEDIN_EMAIL = os.getenv("LINKEDIN_EMAIL")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    keyword: str

def log_debug(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🛠️ DEBUG: {msg}")

def summarize_experience(profile_text):
    try:
        prompt = f"""
        Summarize this LinkedIn profile with clear line breaks:
        🏢 CURRENT: [Role at Company]
        📈 HIGHLIGHT: [Achievement]
        🎓 EDUCATION: [Universities & Degrees - HIGHLIGHT THIS]
        🛠️ SKILLS: [Top Tech Skills]
        
        Text: {profile_text}
        """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except:
        return "Summary unavailable."

def generate_cold_message(name, summary):
    try:
        prompt = f"""
        Write a LinkedIn note from Louis Cui to {name}. 
        Louis: MIT Master of Business Analytics, NYU Math/DS alum.
        Prospect: {summary}
        If MIT/NYU alum, mention it first. Keep under 280 chars.
        """
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()[:290]
    except:
        return "Hi, I'm Louis from MIT Sloan. Would love to connect!"

@app.post("/run-agent")
def run_agent_api(request: SearchRequest):
    log_debug(f"Request received: {request.keyword}")
    results_list = []
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_filename = os.path.join(base_dir, "linkedin_candidates_dashboard.csv")
    
    existing_urls = set()
    if os.path.isfile(csv_filename):
        try:
            with open(csv_filename, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    existing_urls.add(row.get('Profile URL', ''))
        except: pass

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=800)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        try:
            log_debug("Logging in...")
            page.goto("https://www.linkedin.com/login")
            page.fill("input#username", LINKEDIN_EMAIL)
            page.fill("input#password", LINKEDIN_PASSWORD)
            page.click("button[type='submit']")
            page.wait_for_url("**/feed/**", timeout=30000)

            log_debug(f"Searching: {request.keyword}")
            search_url = f"https://www.linkedin.com/search/results/people/?keywords={request.keyword.replace(' ', '%20')}"
            page.goto(search_url)
            
            # --- 关键：强制滚动以加载 2nd/3rd 标签 ---
            for _ in range(3):
                page.mouse.wheel(0, 800)
                time.sleep(2)

            # --- 关键：暴力提取所有非 1st 链接 ---
            people_list = page.evaluate("""() => {
                const results = [];
                const links = Array.from(document.querySelectorAll('a[href*="/in/"]'));
                links.forEach(link => {
                    const url = link.href.split('?')[0];
                    const name = link.innerText.trim();
                    const container = link.closest('.reusable-search__result-container');
                    const text = container ? container.innerText : "";
                    
                    const isFirst = text.includes('• 1st') || text.includes('Message');
                    if (!isFirst && name.length > 1 && !name.includes('LinkedIn Member') && !url.includes('/in/me/')) {
                        results.push({ name: name, url: url });
                    }
                });
                return results;
            }""")

            unique_people = []
            seen = set()
            for p_item in people_list:
                if p_item['url'] not in seen:
                    seen.add(p_item['url'])
                    unique_people.append(p_item)

            log_debug(f"Found {len(unique_people)} target leads (non-1st).")

            # 写入 CSV
            with open(csv_filename, mode='a', newline='', encoding='utf-8') as csv_file:
                fieldnames = ['Search Keyword', 'Name', 'Headline', 'Profile URL', 'Experience Summary', 'Curated Cold Message']
                writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
                if not os.path.isfile(csv_filename) or os.stat(csv_filename).st_size == 0:
                    writer.writeheader()

                for person in unique_people[:8]: # 限制单次抓取数量防封
                    if person['url'] in existing_urls: continue
                    
                    try:
                        log_debug(f"Scraping profile: {person['name']}")
                        page.goto(person['url'], timeout=60000)
                        page.wait_for_selector("main", timeout=20000)
                        time.sleep(random.uniform(3, 5))
                        
                        profile_text = page.locator("main").inner_text()
                        summary = summarize_experience(profile_text)
                        msg = generate_cold_message(person['name'], summary)
                        
                        row_data = {
                            "Search Keyword": request.keyword,
                            "Name": person['name'],
                            "Headline": "Target Prospect",
                            "Profile URL": person['url'],
                            "Experience Summary": summary,
                            "Curated Cold Message": msg
                        }
                        writer.writerow(row_data)
                        csv_file.flush()
                        results_list.append(row_data)
                    except:
                        log_debug(f"Failed to scrape {person['name']}")
                        continue

            browser.close()
            return {"status": "success", "data": results_list}

        except Exception as e:
            log_debug(f"Crash: {str(e)}")
            print(traceback.format_exc())
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
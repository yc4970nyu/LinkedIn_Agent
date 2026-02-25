import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import SearchSection from "@/components/SearchSection";
import LoadingIndicator from "@/components/LoadingIndicator";
import ResultsTable, { type ProspectRow } from "@/components/ResultsTable";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProspectRow[]>([]);

  // ⚠️ 这里就是我们改写成真实请求的核心函数！变成了 async
  const handleSearch = async (query: string) => {
    if (!query) return; // 如果没输入词，就不动
    
    setIsLoading(true); // 开始转圈圈动画
    setResults([]);     // 清空上一轮的搜索结果

    try {
      // 1. 呼叫你的本地 Python 后厨
      const response = await fetch("http://127.0.0.1:8000/run-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: query }) // 把输入框里的词发给 Python
      });

      // 2. 拿到 Python 返回的 JSON 数据
      const data = await response.json();

      if (data.status === "success") {
        // 3. ⭐️ 极其关键：把 Python 的大写字段，转换成 Lovable 表格能看懂的小写字段！
        const formattedResults: ProspectRow[] = data.data.map((item: any, index: number) => ({
          id: String(index + 1), // 自动生成序号
          name: item["Name"],
          headline: item["Headline"] || "Check profile",
          profileUrl: item["Profile URL"],
          experienceSummary: item["Experience Summary"],
          coldMessage: item["Curated Cold Message"],
        }));

        // 4. 把转换好的真实数据塞进表格！
        setResults(formattedResults);
      } else {
        console.error("后端返回了错误:", data);
        alert("抓取失败，请查看浏览器控制台 (Console) 或 Python 终端");
      }
      
    } catch (error) {
      console.error("请求失败:", error);
      alert("请求失败！请确保你的 Python 后端 (http://127.0.0.1:8000) 正在运行！");
    } finally {
      setIsLoading(false); // 无论成功失败，关掉转圈圈动画
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <SearchSection onSearch={handleSearch} isLoading={isLoading} />
      {isLoading && <LoadingIndicator />}
      <ResultsTable data={results} />
    </div>
  );
};

export default Index;
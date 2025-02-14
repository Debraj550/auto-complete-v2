import "./styles.css";
import { useEffect, useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [searchRes, setSearchRes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [cache, setCache] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(-1); // Tracks selected search result index

  const fetchSearchResults = async () => {
    if (!input.length) {
      setSearchRes([]);
      return;
    }
    try {
      if (cache[input]) return cache[input];
      const resp = await fetch(
        "https://dummyjson.com/recipes/search?q=" + input
      );
      const data = await resp.json();
      setSearchRes(data.recipes);
      setCache((prev) => ({ ...prev, [input]: data.recipes }));
    } catch (err) {
      console.error("Error fetching search", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSearchResults, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  const handleKeyDown = (e) => {
    if (!searchRes.length) return;

    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev < searchRes.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchRes.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      setInput(searchRes[selectedIndex].name);
      setShowResults(false);
    }
  };

  return (
    <div className="App">
      <div>
        <input
          placeholder="Search"
          className="search-input"
          value={input}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onChange={(e) => {
            setInput(e.target.value);
            setSelectedIndex(-1); // Reset selection when typing
          }}
          onKeyDown={handleKeyDown}
          type="text"
        />
      </div>

      {showResults && (
        <SearchResults
          setInput={setInput}
          data={searchRes}
          selectedIndex={selectedIndex}
          setShowResults={setShowResults}
        />
      )}
    </div>
  );
}

const SearchResults = ({ data, setInput, selectedIndex, setShowResults }) => {
  return (
    <div className="search-results-container">
      {data?.map((search, index) => (
        <div
          key={search.id}
          onMouseDown={() => {
            setInput(search.name);
            setShowResults(true);
          }}
          className={`search-result ${
            index === selectedIndex ? "selected" : ""
          }`}
        >
          {search.name}
        </div>
      ))}
    </div>
  );
};

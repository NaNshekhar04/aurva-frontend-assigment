import { useState, useEffect } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data.categories || data.meals);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
};

export default useFetch;

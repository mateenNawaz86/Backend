import { useState } from "react";
import "./App.css";

function App() {
  const [product, setProduct] = useState([]);

  return (
    <>
      <h1>By my own Products</h1>

      {product.map((item) => {
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>;
      })}
    </>
  );
}

export default App;

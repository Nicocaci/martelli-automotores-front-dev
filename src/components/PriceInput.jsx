import React, { useState } from "react";

const PriceInput = () => {
  const [price, setPrice] = useState(0); // Estado inicial del precio

  const handleIncrease = () => {
    setPrice((prevPrice) => prevPrice + 10000); // Incrementa en 10,000
  };

  const handleDecrease = () => {
    setPrice((prevPrice) => (prevPrice >= 10000 ? prevPrice - 10000 : 0)); // Decrementa en 10,000 pero no baja de 0
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setPrice(Number(newValue)); // Actualiza el precio directamente desde el input
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <label htmlFor="price" className="text-lg font-semibold">
        Ofertar subasta:
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 focus:outline-none"
        >
          -
        </button>
        <input
          type="text"
          id="price"
          value={price}
          onChange={handleChange}
          placeholder="Escriba un precio"
          className="border-2 border-gray-300 rounded-lg p-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleIncrease}
          className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
        >
          +
        </button>
      </div>
      <p className="text-lg">
        Precio actual: <span className="font-bold text-blue-600">${price}</span>
      </p>
    </div>
  );
};

export default PriceInput;

import { useState } from "react";

const AutocompleteInput = ({ clientes, newOrder, setNewOrder }) => {
  const [filteredclientes, setFilteredclientes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const value2 = e.target.key;
    setNewOrder({ ...newOrder, cli_id: value2, cliente: value });

    if (value.length > 0) {
      const filtered = clientes.filter((cliente) => {
        const nombre = cliente?.cli_nombre?.toLowerCase() || "";
        return nombre.includes(value.toLowerCase());
      });
      setFilteredclientes(filtered);
      setShowDropdown(true);
    } else {
      setFilteredclientes([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (id, name, address) => {
    setNewOrder({ ...newOrder, cli_id: id, cliente: name, direccion: address });
    setShowDropdown(false);
  };


  return (
    <div className="relative space-y-2">
      <label htmlFor="client" className="text-sm font-medium">
        Cliente
      </label>

      <input
        type="text"
        id="client"
        name="client"
        autoComplete="off"
        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
        placeholder="Buscar cliente..."
        value={newOrder.cliente || ""}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onFocus={() => {
          if (newOrder.cliente) setShowDropdown(true);
        }}
      />

      {showDropdown && filteredclientes.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto">
          {filteredclientes.map((cliente) => (
            <li
              key={cliente.cli_id}
              onMouseDown={() => handleSelect(cliente.cli_id, cliente.cli_nombre, cliente.cli_direccion)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-600"
            >
              {cliente.cli_nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;

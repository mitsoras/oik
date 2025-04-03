import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const CsvTable = () => {
  const [data, setData] = useState([]);
  const [vatNumber, setVatNumber] = useState(""); // Α.Φ.Μ filter
  const [supplierCode, setSupplierCode] = useState(""); // Κωδ.Προμηθευτή filter
  const [year, setYear] = useState(""); // Έτος filter
  const [uniqueYears, setUniqueYears] = useState([]); // List of years for dropdown

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data.csv")
      .then(response => response.arrayBuffer()) // Read as binary
      .then(buffer => {
        const decoder = new TextDecoder("iso-8859-7"); // Decode Greek ISO-8859-7
        const csvText = decoder.decode(buffer);
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

        setData(parsed.data);

        // Extract unique years for the dropdown
        const years = [...new Set(parsed.data.map(row => row["Έτος"]?.trim()).filter(Boolean))];
        setUniqueYears(years.sort()); // Sort years for better display
      });
  }, []);

  // Filter data: Show only rows where Α.Φ.Μ, Κωδ.Προμηθευτή, and Έτος match the inputs
  const filteredData = data.filter(row => {
    const matchesVat = vatNumber === "" || row["Α.Φ.Μ"]?.trim() === vatNumber;
    const matchesSupplier = supplierCode === "" || row["Κωδ.Προμηθευτή"]?.trim() === supplierCode;
    const matchesYear = year === "" || row["Έτος"]?.trim() === year;
    return matchesVat && matchesSupplier && matchesYear; // All conditions must match
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Greek CSV Viewer with Multiple Filters</h2>

      {/* Α.Φ.Μ (VAT) Input */}
      <input
        type="text"
        placeholder="Εισαγάγετε Α.Φ.Μ"
        value={vatNumber}
        onChange={(e) => setVatNumber(e.target.value)}
        style={{ padding: "10px", marginRight: "10px", fontSize: "16px" }}
      />

      {/* Κωδ.Προμηθευτή (Supplier Code) Input */}
      <input
        type="text"
        placeholder="Εισαγάγετε Κωδ.Προμηθευτή"
        value={supplierCode}
        onChange={(e) => setSupplierCode(e.target.value)}
        style={{ padding: "10px", marginRight: "10px", fontSize: "16px" }}
      />

      {/* Έτος (Year) Dropdown */}
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        style={{ padding: "10px", fontSize: "16px" }}
      >
        <option value="">Όλα τα έτη</option>
        {uniqueYears.map((yr, index) => (
          <option key={index} value={yr}>
            {yr}
          </option>
        ))}
      </select>

      {/* Display Table */}
      <table border="1" style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((key) => key !== "Φορέας") // Remove "Φορέας"
                .map((key, index) => <th key={index}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.entries(row)
                  .filter(([key]) => key !== "Φορέας") // Remove "Φορέας"
                  .map(([_, cell], cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={data.length > 0 ? Object.keys(data[0]).length - 1 : 1} style={{ textAlign: "center" }}>
                ❌ Δεν βρέθηκαν αποτελέσματα
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CsvTable;


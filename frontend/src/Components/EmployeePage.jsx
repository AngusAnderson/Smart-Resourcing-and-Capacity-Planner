// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../css/Employee_Project.css";

// // const mockEmployee = {
// //   id: 1,
// //   name: "Employee B",
// //   excludedFromAI: false,
// //   specialisms: [
// //     "Frontend Developer",
// //     "Backend Developer",
// //     "Edge Delivery Services"
// //   ],
// //   previousProjects: ["Project X", "Project Y", "Project Z"],
// //   currentProjects: ["Project A"],
// //   futureProjects: ["Project B", "Project C"]
// // };

// function EmployeePage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [employee, setEmployee] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   async function fetchEmployee() {
//   //     try {
//   //       // we will add this later when backend and frontend are linked
//   //       // const res = await axios.get(`/api/employees/${id}/`);
//   //       // setEmployee(res.data);
//   //       setEmployee(mockEmployee);
//   //     } catch (err) {
//   //       console.error("Failed to load employee", err);
//   //     }
//   //   }
//   //   fetchEmployee();
//   // }, [id]);

//   // if (!employee) return null;

//   useEffect(() => {
//     fetchEmployee();
//   }, []);
//   const fetchEmployee = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/employees/${id}`);
//       setEmployee(response.data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching employee:", err);
//       setError("Failed to fetch employee.");
//     }

//   return (
//     <div className="detail-page">
//       <div className="detail-top-row">
//         <button className="back-button" onClick={() => navigate("/")}>
//           Back to Calendar Page
//         </button>
//       </div>

//       <div className="employee-layout">
//         <main className="employee-main">
//           <div className="employee-header-row">
//             <h1 className="employee-name">{employee.name}</h1>
//             <button className="pill-button">Edit</button>
//           </div>

//           <div className="employee-body-card">
//             <p className="label-line">
//               <span className="label">Excluded From AI:</span>{" "}
//               <span>{employee.excludedFromAI ? "True" : "False"}</span>
//             </p>

//             <h2 className="section-title">Specialisms:</h2>
//             <ul className="specialism-list">
//               {employee.specialisms.map((s) => (
//                 <li key={s}>{s}</li>
//               ))}
//             </ul>
//           </div>
//         </main>

//         <aside className="employee-side">
//           <div className="side-card">
//             <h2 className="side-heading">Previous Projects</h2>
//             <ul className="side-list">
//               {employee.previousProjects.map((p) => (
//                 <li key={p}>{p}</li>
//               ))}
//             </ul>
//           </div>

//           <div className="side-card">
//             <h2 className="side-heading">Current Projects</h2>
//             <ul className="side-list">
//               {employee.currentProjects.map((p) => (
//                 <li key={p}>{p}</li>
//               ))}
//             </ul>
//           </div>

//           <div className="side-card">
//             <h2 className="side-heading">Future Projects</h2>
//             <ul className="side-list">
//               {(employee.futureProjects || []).map((p) => (
//                 <li key={p}>{p}</li>
//               ))}
//             </ul>
//           </div>

//           <button className="pill-button side-edit-button">Edit</button>
//         </aside>
//       </div>
//     </div>
//   );
// }
// }

// export default EmployeePage;


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "../css/Employee_Project.css";

function EmployeePage() {
  const { id } = useParams(); // id is the employee slug
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${id}/`);
      setEmployee(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching employee:", err);
      setError("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="detail-page">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!employee) return <div className="detail-page">Employee not found</div>;

//   return (
//     <div className="employee-page">
//       <h1>{employee.name}</h1>
//       <div className="employee-details">
//         <p><strong>Specialisms:</strong> {employee.specialisms.join(", ") || "None"}</p>
//         <p><strong>Excluded from AI:</strong> {employee.excludedFromAI ? "Yes" : "No"}</p>
//       </div>
//       {/* Add more employee details as needed */}
//     </div>
//   );
// }

// export default EmployeePage;

 return (
    <div className="detail-page">
      <div className="detail-top-row">
        <button className="back-button" onClick={() => navigate("/employees")}>
          Back to Employees
        </button>
      </div>

      <div className="employee-layout">
        <main className="employee-main">
          <div className="employee-header-row">
            <h1 className="employee-name">{employee.name}</h1>
          </div>

          <div className="employee-body-card">
            <p className="label-line">
              <span className="label">Excluded From AI:</span>{" "}
              <span>{employee.excludedFromAI ? "Yes" : "No"}</span>
            </p>

            <h2 className="section-title">Specialisms:</h2>
            <ul className="specialism-list">
              {(employee.specialisms || []).length ? (
                employee.specialisms.map((s) => <li key={s}>{s}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>
        </main>

        <aside className="employee-side">
          <div className="side-card">
            <h2 className="side-heading">Employee Info</h2>
            <ul className="side-list">
              <li>ID: {employee.employeeID}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EmployeePage;
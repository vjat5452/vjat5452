import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const EmployeeList = ({ onEdit, onAddEmployee }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); 

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            // Sort employees
            const sorted = response.data.sort((a, b) => {
                const typePriority = { "Org Manager": 1, "Manager": 2, "Employee": 3, "Intern": 4, "Other": 5 };
                const typeA = typePriority[a.employeeType] || 100;
                const typeB = typePriority[b.employeeType] || 100;
                if (typeA !== typeB) return typeA - typeB;
                return a.name.localeCompare(b.name);
            });
            setEmployees(sorted);
            setError('');
        } catch (error) {
            console.error('Error loading employees:', error);
            setError('Failed to load employees. Please check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (employeeId, employeeName) => {
        // We assume the backend will return an error if deleting a manager with subordinates
        if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
            try {
                await employeeAPI.delete(employeeId);
                loadEmployees(); 
            } catch (error) {
                // The backend error will be shown to the user
                alert(error.response?.data?.message || 'Error deleting employee. They may still manage other employees.');
            }
        }
    };

    // Helper to get CSS class for badges
    const getEmployeeTypeClass = (employeeType) => {
        switch (employeeType) {
            case 'Org Manager': return 'type-badge-org-manager';
            case 'Manager': return 'type-badge-manager';
            case 'Employee': return 'type-badge-employee';
            case 'Intern': return 'type-badge-intern';
            case 'Other': return 'type-badge-other';
            default: return 'type-badge-other';
        }
    };

    // Helper to get initials for the avatar
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length === 1) return name.substring(0, 2).toUpperCase();
        return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="page-wrapper"><div className="loading">Loading employees...</div></div>;
    if (error) return <div className="page-wrapper"><div className="error-message">{error}</div></div>;

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h2>Employee Directory</h2>
                <div className="header-actions">
                    <input
                        type="search"
                        className="search-input"
                        placeholder="Filter by name, position, department..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button onClick={onAddEmployee} className="btn-add">
                        Add New Employee
                    </button>
                </div>
            </div>

            <div className="page-content-card">
                {employees.length === 0 ? (
                    <div className="no-data">
                        <h3>No Employees Found</h3>
                        <p>Click "Add New Employee" to get started.</p>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="no-data">
                        <h3>No Employees Match Your Search</h3>
                        <p>Try a different search term or clear the filter.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="employees-table">
                            <thead>
                                <tr>
                                    <th>Employee</th> 
                                    <th>Department</th>
                                    <th>Employee Type</th>
                                    <th>Manager</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(employee => (
                                    <tr key={employee._id}>
                                        <td data-label="Employee" className="employee-cell-main">
                                            <div 
                                                className="employee-avatar"
                                                style={{backgroundColor: getAvatarColor(employee.name)}}
                                            >
                                                {getInitials(employee.name)}
                                            </div>
                                            <div className="employee-info">
                                                <strong className="employee-name-strong">{employee.name}</strong>
                                                <span className="employee-position-small">{employee.position}</span>
                                            </div>
                                        </td>
                                        <td data-label="Department">{employee.department}</td>
                                        <td data-label="Type">
                                            <span 
                                                className={`type-badge ${getEmployeeTypeClass(employee.employeeType)}`}
                                            >
                                                {employee.employeeType}
                                            </span>
                                        </td>
                                        <td data-label="Manager">
                                            {employee.manager?.name || '—'}
                                        </td>
                                        <td data-label="Email">
                                            <a href={`mailto:${employee.email}`} className="employee-email-link">
                                                {employee.email}
                                            </a>
                                        </td>
                                        <td data-label="Actions" className="table-actions">
                                            <button 
                                                onClick={() => onEdit(employee)}
                                                className="btn-edit"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(employee._id, employee.name)}
                                                className="btn-delete"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="page-footer">
                <p>
                    Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> total employees
                </p>
            </div>
        </div>
    );
};

// Avatar color helper (unchanged)
const avatarColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#7f8c8d'
];
const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[charCodeSum % avatarColors.length];
};

export default EmployeeList;
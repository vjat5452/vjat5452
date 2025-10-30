import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const EmployeeForm = ({ employee, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        position: '',
        employeeType: 'Employee',
        manager: ''
    });
    
    const [allEmployees, setAllEmployees] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Load all employees once, and set form data when 'employee' prop changes
    useEffect(() => {
        loadAllEmployees();
        
        if (employee) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                department: employee.department || '',
                position: employee.position || '',
                employeeType: employee.employeeType || 'Employee',
                manager: employee.manager?._id || ''
            });
        } else {
            // Reset form when switching from edit to add
            setFormData({
                name: '',
                email: '',
                department: '',
                position: '',
                employeeType: 'Employee',
                manager: ''
            });
        }
    }, [employee]);

    // Step 2: This effect recalculates the available managers
    // whenever the selected employee type or the list of employees changes.
    useEffect(() => {
        if (allEmployees.length === 0) return;

        let filteredManagers = [];

        // *** THIS IS THE FINAL BUSINESS LOGIC ***
        if (formData.employeeType === 'Manager') {
            // Rule: Managers can ONLY report to Org Managers
            filteredManagers = allEmployees.filter(emp => emp.employeeType === 'Org Manager');
        
        } else if (formData.employeeType !== 'Org Manager') {
            // Rule: Employees, Interns, Other can report to Org Managers, Managers, OR other Employees
            filteredManagers = allEmployees.filter(emp => 
                emp.employeeType === 'Org Manager' ||
                emp.employeeType === 'Manager' ||
                emp.employeeType === 'Employee' // This allows employees to be managers
            );
        }
        // *** END OF LOGIC ***

        // Always filter out the employee themselves (if editing)
        if (employee) {
            filteredManagers = filteredManagers.filter(m => m._id !== employee._id);
        }

        setAvailableManagers(filteredManagers);

        // Step 3: Validate the currently selected manager
        // If the current manager is no longer in the valid list, reset the field
        if (formData.manager) {
            const isManagerStillValid = filteredManagers.some(m => m._id === formData.manager);
            if (!isManagerStillValid) {
                setFormData(prevData => ({ ...prevData, manager: '' }));
            }
        }
        
    }, [formData.employeeType, allEmployees, employee]); // Dependencies for the effect

    // Loads ALL employees into state for filtering
    const loadAllEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            setAllEmployees(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading employees:', error);
            setError('Failed to load employee list');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const dataToSave = { ...formData };
        if (dataToSave.employeeType === 'Org Manager') {
            dataToSave.manager = null; // Org Managers never have a manager
        }

        // Final check to ensure a manager is selected if required
        if (dataToSave.employeeType !== 'Org Manager' && !dataToSave.manager) {
            setError('This employee type requires a manager.');
            setLoading(false);
            return;
        }

        try {
            if (employee) {
                await employeeAPI.update(employee._id, dataToSave);
            } else {
                await employeeAPI.create(dataToSave);
            }
            onSave();
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
            </div>
            
            <div className="page-content-card">
                <form onSubmit={handleSubmit} className="employee-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter employee's full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading || employee} // Disable email edit
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter department"
                                />
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter job position"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Employee Type & Reporting</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Employee Type</label>
                                <select
                                    name="employeeType"
                                    value={formData.employeeType}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="Org Manager">Org Manager</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Intern">Intern</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            {formData.employeeType !== 'Org Manager' && (
                                <div className="form-group">
                                    <label>Reporting Manager</label>
                                    <select
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                    >
                                        <option value="">Select a manager</option>
                                        {/* This maps over the DYNAMIC availableManagers state */}
                                        {availableManagers.map(manager => (
                                            <option key={manager._id} value={manager._id}>
                                                {manager.name} ({manager.employeeType})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="form-info">
                            {/* Final updated info texts */}
                            {formData.employeeType === 'Org Manager' && (
                                <p> **Org Manager**: A top-level position, does not report to anyone.</p>
                            )}
                            {formData.employeeType === 'Manager' && (
                                <p> **Manager**: Reports **only** to an 'Org Manager'.</p>
                            )}
                            {formData.employeeType === 'Employee' && (
                                <p> **Employee**: Reports to a 'Manager', 'Org Manager', or another 'Employee'. Can also have other employees report to them.</p>
                            )}
                            {formData.employeeType === 'Intern' && (
                                <p> **Intern**: Reports to a 'Manager', 'Org Manager', or 'Employee'.</p>
                            )}
                            {formData.employeeType === 'Other' && (
                                <p> **Other**: Reports to a 'Manager', 'Org Manager', or 'Employee'.</p>
                            )}
                        </div>
                    </div>
                </form>
                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        disabled={loading}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-submit"
                        onClick={handleSubmit} 
                    >
                        {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Add Employee')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;
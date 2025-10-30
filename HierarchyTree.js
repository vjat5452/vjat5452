import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
// No CSS import needed, all styles are in App.css

const HierarchyTree = () => {
    const [employees, setEmployees] = useState([]);
    // State is an array to hold all Org Managers
    const [orgManagers, setOrgManagers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await employeeAPI.getAll();
            const allEmployees = response.data;
            setEmployees(allEmployees);
            
            // Find all employees with type 'Org Manager'
            const allOrgManagers = allEmployees.filter(emp => emp.employeeType === 'Org Manager');
            setOrgManagers(allOrgManagers);
            setLoading(false);
        } catch (error) {
            console.error('Error loading employees:', error);
            setLoading(false);
        }
    };

    // Recursive component for the list-style tree
    const TreeNode = ({ employee }) => {
        // State to manage if the node is expanded or collapsed
        const [isExpanded, setIsExpanded] = useState(true);
        
        // Find direct subordinates
        const subordinates = employees.filter(emp => 
            emp.manager && emp.manager._id === employee._id
        );
        const hasChildren = subordinates.length > 0;
        const childCount = subordinates.length;

        return (
            <div className="tree-list-node">
                {/* This is the row for the employee */}
                <div className="node-item">
                    {hasChildren ? (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="toggle-btn">
                            {isExpanded ? '−' : '+'}
                        </button>
                    ) : (
                        // This placeholder keeps non-managers aligned
                        <span className="toggle-placeholder"></span>
                    )}
                    
                    {/* Display employee info */}
                    <span className="node-label">
                        {employee.name}
                        
                        {/* Child count badge */}
                        {hasChildren && (
                            <span className="node-meta node-meta-count">
                                {childCount} {childCount > 1 ? 'Subordinates' : 'Subordinate'}
                            </span>
                        )}

                        {/* Position is kept, Department is removed */}
                        {employee.position && (
                            <span className="node-meta">{employee.position}</span>
                        )}
                    </span>
                </div>
                
                {/* If expanded, render the children in a nested container */}
                {isExpanded && hasChildren && (
                    <div className="node-children">
                        {subordinates.map(subordinate => (
                            <TreeNode key={subordinate._id} employee={subordinate} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="page-wrapper"><div className="loading">Loading organization hierarchy...</div></div>;

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h2>Organization Hierarchy</h2>
            </div>

            <div className="page-content-card">
                {/* Check if the orgManagers array is empty */}
                {orgManagers.length === 0 ? (
                    <div className="no-hierarchy">
                        <h3>No Organization Structure Found</h3>
                        <p>Please add an 'Org Manager' to build the hierarchy.</p>
                        <p>Go to "Add Employee" and select "Org Manager" as the Employee Type.</p>
                    </div>
                ) : (
                    <div className="tree-list-container">
                        {/* Map over all found Org Managers and render a tree for each */}
                        {orgManagers.map(manager => (
                            <TreeNode key={manager._id} employee={manager} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HierarchyTree;
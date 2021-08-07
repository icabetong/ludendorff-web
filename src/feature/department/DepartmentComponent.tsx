import React, { useState, useEffect } from "react";
import { Department, DepartmentRepository } from "./Department";

export const DepartmentComponent = () => {
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        DepartmentRepository.fetch()
            .then((data) => {
                setDepartments(data);
            })
    }, []);

    return (
        <div>
            { departments.map((department: Department) => {
                return <div key={department.departmentId}>{department.name}</div>
            })}
        </div>
    )
}
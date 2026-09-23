import axios from 'axios';

const API_URL = 'http://localhost:8000/api/students/';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const studentService = {
  // Fetch only students for the supervisor's school
  getStudents: () => axios.get(API_URL, getAuthHeader()),
  
  // Add a new student to the DB
  addStudent: (studentData: any) => axios.post(API_URL, studentData, getAuthHeader()),
  
  // Remove a student from the DB
  deleteStudent: (id: number) => axios.delete(`${API_URL}${id}/`, getAuthHeader()),
};
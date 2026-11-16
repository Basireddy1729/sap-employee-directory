using { directory } from '../db/schema';

@path: '/api/directory'
@requires: 'authenticated-user'
service EmployeeService {
  entity Employees as projection on directory.Employees;
}

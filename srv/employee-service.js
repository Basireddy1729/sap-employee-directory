const cds = require('@sap/cds');

module.exports = class EmployeeService extends cds.ApplicationService {
  init() {
    this.before(['CREATE', 'UPDATE'], 'Employees', req => {
      for (const key of ['firstName', 'lastName', 'email', 'department', 'jobTitle']) {
        if (key in req.data) {
          if (typeof req.data[key] !== 'string' || !req.data[key].trim()) {
            return req.reject(400, `${key} must not be empty`);
          }
          req.data[key] = req.data[key].trim();
        }
      }
      if ('email' in req.data) {
        req.data.email = req.data.email.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.data.email)) {
          return req.reject(400, 'Enter a valid email address');
        }
      }
      if ('status' in req.data && !['Active', 'On Leave'].includes(req.data.status)) {
        return req.reject(400, 'Status must be Active or On Leave');
      }
    });
    return super.init();
  }
};

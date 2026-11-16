namespace directory;

using { cuid, managed } from '@sap/cds/common';

// An entity becomes a database table; each employee gets a unique ID.
entity Employees : cuid, managed {
  firstName  : String(80) not null @mandatory;
  lastName   : String(80) not null @mandatory;
  email      : String(160) not null @mandatory;
  department : String(80) not null @mandatory;
  jobTitle   : String(120) not null @mandatory;
  location   : String(100);
  startDate  : Date;
  status     : String(20) enum { Active; OnLeave = 'On Leave'; } default 'Active';
}

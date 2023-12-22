export class StylistDetails {
  accountId: number;
  firstName: string;
  mobileNo: number;
  mobileNoDialCode: string;
  // mobileNoCountryCode: string;
  mobilNoCountryCode: string;
  roleId: number;
  roleCode: string;
  professionId: number;
  professionistGradeId: number;
  email: string;
  address: string;
  roleCodes: ["ST", "MG"];
  active: string;
  incentiveType: string;
  dailyIncentiveProduct: number;
  dailyIncentiveService: number;
  monthIncentiveProduct: number;
  monthIncentiveService: number;
}
export class ProfessionList {
  professionId: number;
  name: string;
}
export class ProfessionGrade {
  professionistGradeId: number;
  name: string;
}
export class RoleList {
  roleId: number;
  name: string;
}

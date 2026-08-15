export type T_Registration_Request = {
  f_name: string;
  l_name: string;
  email: string;
  password: string;
};

export type T_Registration_User = {
  id: string;
  email: string;
  f_name: string;
  l_name: string;
  role: "EMPLOYEE";
  status: "PENDING";
  created_at: string;
};

export type T_Registration_Responce = {
  message: string;
  user: T_Registration_User;
};

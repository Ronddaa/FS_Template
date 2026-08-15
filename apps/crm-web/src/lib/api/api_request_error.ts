type T_Api_Request_Error_Parameters = {
  message: string;
  status_code: number;
  code?: string;
};

export class Api_Request_Error extends Error {
  readonly status_code: number;
  readonly code: string | undefined;

  constructor({ message, status_code, code }: T_Api_Request_Error_Parameters) {
    super(message);

    this.name = "Api_Request_Error";
    this.status_code = status_code;
    this.code = code;
  }
}

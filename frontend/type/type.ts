export type AccessCheckRequest = {
  user: string;
  file: string;
  action: "read" | "write";
};

export type AccessCheckResponse = {
  allowed: boolean;
  output: string;
  error: string;
  code: number;
};

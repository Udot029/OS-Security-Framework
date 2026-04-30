export type AccessCheckRequest = {
  user: string;
  file: string;
  action: "read" | "write";
  policy?: "bell" | "biba";
};

export type AccessCheckResponse = {
  allowed: boolean;
  output: string;
  error: string;
  code: number;
};

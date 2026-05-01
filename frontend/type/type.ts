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

export type BackendConfig = {
  securityModel: "bell" | "biba";
  subjects: Record<string, number>;
  objects: Record<string, number>;
  files: string[];
  policies: Array<"bell" | "biba">;
  actions: Array<"read" | "write">;
};

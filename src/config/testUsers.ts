export interface TestUser {
  id: string;
  username: string;
  password: string;
  name: string;
  program: string;
}

/** Local-only test accounts — each user gets separate saved data */
export const TEST_USERS: TestUser[] = [
  {
    id: "test1",
    username: "test1",
    password: "test123",
    name: "Test User One",
    program: "Computer Science",
  },
  {
    id: "test2",
    username: "test2",
    password: "test123",
    name: "Test User Two",
    program: "Computer Science",
  },
  {
    id: "test3",
    username: "test3",
    password: "test123",
    name: "Test User Three",
    program: "Information Technology",
  },
];

export function findTestUser(username: string, password: string): TestUser | null {
  const normalized = username.trim().toLowerCase();
  return (
    TEST_USERS.find(
      (user) => user.username.toLowerCase() === normalized && user.password === password
    ) ?? null
  );
}

export function findTestUserById(id: string): TestUser | null {
  return TEST_USERS.find((user) => user.id === id) ?? null;
}

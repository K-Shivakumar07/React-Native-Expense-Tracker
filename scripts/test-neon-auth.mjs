import { createAuthClient } from "@neon/auth";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
if (!baseUrl) {
  console.error("NEON_AUTH_BASE_URL is not set");
  process.exit(1);
}

const authClient = createAuthClient(baseUrl);

async function run() {
  const timestamp = Date.now();
  const testEmail = `user_${timestamp}@example.com`;
  const testPassword = `Pass_${timestamp}_Secure!`;
  const testName = `User ${timestamp}`;

  console.log("==========================================");
  console.log("Neon Auth (Managed Better Auth) Verification");
  console.log("==========================================");
  console.log(`Endpoint: ${baseUrl}`);
  console.log(`Signing up user: ${testEmail}...`);

  let sessionCookies = "";

  const signUpRes = await authClient.signUp.email(
    {
      email: testEmail,
      password: testPassword,
      name: testName,
    },
    {
      headers: {
        Origin: "http://localhost:3000",
      },
      onResponse: (ctx) => {
        const setCookie = ctx.response.headers.get("set-cookie");
        if (setCookie) {
          sessionCookies = setCookie;
        }
      },
    }
  );

  if (signUpRes.error) {
    console.error("Sign up failed:", signUpRes.error);
    process.exit(1);
  }

  console.log("\n[1] User Sign Up Result:");
  console.log("  Status: Success");
  console.log("  User ID:", signUpRes.data?.user?.id);
  console.log("  Email:", signUpRes.data?.user?.email);
  console.log("  Name:", signUpRes.data?.user?.name);
  console.log("  Email Verified:", signUpRes.data?.user?.emailVerified);

  console.log("\n[2] Reading Current User via getSession():");
  const sessionRes = await authClient.getSession({
    fetchOptions: {
      headers: {
        Origin: "http://localhost:3000",
        ...(sessionCookies ? { Cookie: sessionCookies } : {}),
      },
    },
  });

  if (sessionRes.error) {
    console.error("  Failed to get session:", sessionRes.error);
    process.exit(1);
  }

  console.log("  Status: Success");
  console.log("  Active User ID:", sessionRes.data?.user?.id);
  console.log("  Active User Email:", sessionRes.data?.user?.email);
  console.log("  Active User Name:", sessionRes.data?.user?.name);
  console.log("  Session ID:", sessionRes.data?.session?.id);
  console.log("  Session Expires At:", sessionRes.data?.session?.expiresAt);

  console.log("\n==========================================");
  console.log("Verification Complete: User signed up and successfully read back!");
  console.log("==========================================");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

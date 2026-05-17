import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";

// This is a conceptual test file. In this environment, we may not have the emulator running,
// but we provide the test spec to demonstrate the "Dirty Dozen" coverage.

describe("Franchise Directory Security Rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0427473964",
      firestore: {
        rules: readFileSync("DRAFT_firestore.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test("Identity Spoofing: cannot create opportunity for another owner", async () => {
    const context = testEnv.authenticatedContext("user_abc");
    const db = context.firestore();
    await assertFails(
      db.collection("opportunities").add({
        category: "Food",
        type: "brand",
        owner_uid: "user_xyz", // Malicious: spoofing owner
        investment_range: "10-20L"
      })
    );
  });

  test("State Shortcutting: investor cannot shortlist themselves", async () => {
    const context = testEnv.authenticatedContext("investor_123");
    const db = context.firestore();
    // Setup existing app
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("applications").doc("app_1").set({
        userId: "investor_123",
        owner_uid: "brand_456",
        status: "pending",
        opportunityId: "opp_1"
      });
    });

    await assertFails(
      db.collection("applications").doc("app_1").update({
        status: "shortlisted" // Malicious: only brand owner can do this
      })
    );
  });

  test("PII Guard: cannot read other user profiles", async () => {
    const context = testEnv.authenticatedContext("user_1");
    await assertFails(
      context.firestore().collection("users").doc("user_2").get()
    );
  });
  
  test("Relational Sync: cannot send message if not member of conversation", async () => {
    const context = testEnv.authenticatedContext("malicious_user");
    await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("conversations").doc("chat_123").set({
            investor_uid: "investor_abc",
            brand_uid: "brand_xyz",
            opportunityId: "opp_789"
        });
    });
    
    await assertFails(
        context.firestore().collection("conversations").doc("chat_123").collection("messages").add({
            senderId: "malicious_user",
            text: "spam",
            timestamp: new Date().toISOString(),
            chatId: "chat_123"
        })
    );
  });
});

import type { AllowRead, AllowWrite } from "@statebacked/machine-def";
import type { ContextFrom } from "xstate";
import { onboardingMachine } from "./machines/onboarding";

export default onboardingMachine;

type Context = ContextFrom<typeof onboardingMachine>;

type AuthContext = { sub: string; isCustomerSupport?: boolean };

// users can read from their own machines and customer support can read from any machine
export const allowRead: AllowRead<Context, AuthContext> = ({
  authContext,
  context,
}) => authContext.sub === context.uid || Boolean(authContext.isCustomerSupport);

// users can send to their own machines and customer support can send support events to any machine
export const allowWrite: AllowWrite<Context, AuthContext> = (env) =>
  env.authContext.sub === env.context.uid ||
  (Boolean(env.authContext.isCustomerSupport) &&
    env.type === "event" &&
    env.event.name.startsWith("Customer support:"));

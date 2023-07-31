import type { AllowRead, AllowWrite } from "@statebacked/machine-def";
import type { ContextFrom } from "xstate";
import { emailAutomationMachine } from "./machines/email-automation";
import { AuthContext } from "./auth-context";

export default emailAutomationMachine;

type Context = ContextFrom<typeof emailAutomationMachine>;

// users can read from their own machines
export const allowRead: AllowRead<Context> = ({
  authContext,
  machineInstanceName,
}) => authContext.sub === machineInstanceName;

export const allowWrite: AllowWrite<Context, AuthContext> = ({
  authContext,
  machineInstanceName,
  type,
  context,
}) => {
  if (authContext.sub !== machineInstanceName) {
    // users can only write to their own machines
    return false;
  }

  if (type === "initialization" && context.userEmail === authContext.email) {
    // machines must be initialized with a valid email address
    return false;
  }

  return true;
};

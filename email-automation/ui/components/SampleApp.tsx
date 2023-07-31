"use client";

import { Event } from "@statebacked/client";
import useStateBackedMachineInstance from "./hooks/useStateBackedMachineInstance";
import type {
  NestedState,
  StateValue,
} from "../../statebacked/src/machines/email-automation";

export default function SampleApp({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [sbState, sendEvent] = useStateBackedMachineInstance<StateValue>(
    getStateBackedToken,
    "email-automation",
    userId,
    { userEmail: email },
  );

  if (sbState.type === "loading") {
    return <p>Loading...</p>;
  }

  if (sbState.type === "error") {
    return (
      <p className="text-red">
        Oops! {sbState.error.name}: {sbState.error.message}
      </p>
    );
  }

  const state = sbState.state;
  if (state === "complete") {
    return <p>Completed email series and completed all user steps</p>;
  }

  const emailSenderState = state.run?.emailSender;
  const newUserState =
    state.run?.userState === "userIsSupporter"
      ? undefined
      : state.run?.userState?.newUser;

  return (
    <>
      <EmailSenderDisplay emailSenderState={emailSenderState} />
      <UserState newUserState={newUserState} sendEvent={sendEvent} />
    </>
  );
}

function EmailSenderDisplay({
  emailSenderState,
}: {
  emailSenderState?: NestedState<StateValue, ["run", "emailSender"]>;
}) {
  return <p>Email sending state: {emailSenderState}</p>;
}

function UserState({
  newUserState,
  sendEvent,
}: {
  newUserState: NestedState<StateValue, ["run", "userState", "newUser"]>;
  sendEvent: (event: Event) => Promise<void>;
}) {
  if (!newUserState) {
    return <p>User has completed onboarding</p>;
  }

  return (
    <>
      {JSON.stringify(newUserState)}
      <DocumentActivity
        documentActivityState={newUserState.documentActivity}
        sendEvent={sendEvent}
      />
      <OrgActivity
        orgActivityState={newUserState.organizationActivity}
        sendEvent={sendEvent}
      />
    </>
  );
}

const btnClass =
  "py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover";

function OrgActivity({
  orgActivityState,
  sendEvent,
}: {
  orgActivityState: NestedState<
    StateValue,
    ["run", "userState", "newUser", "organizationActivity"]
  >;
  sendEvent: (event: Event) => Promise<void>;
}) {
  if (orgActivityState === "noOrganization") {
    return (
      <div>
        <button
          className={btnClass}
          onClick={() => sendEvent({ type: "createdOrganization" })}
        >
          Create organization
        </button>
      </div>
    );
  }

  if (orgActivityState === "completedOrganization") {
    return <div>Completed all organization activities</div>;
  }

  return (
    <div>
      <InvitationActivity
        invitationStatus={
          orgActivityState?.createdOrganization?.invitationStatus
        }
        sendEvent={sendEvent}
      />
      <PlanActivity
        planStatus={orgActivityState?.createdOrganization?.planStatus}
        sendEvent={sendEvent}
      />
    </div>
  );
}

function PlanActivity({
  planStatus,
  sendEvent,
}: {
  planStatus: NestedState<
    StateValue,
    [
      "run",
      "userState",
      "newUser",
      "organizationActivity",
      "createdOrganization",
      "planStatus",
    ]
  >;
  sendEvent: (event: Event) => Promise<void>;
}) {
  if (planStatus === "paidPlan") {
    return (
      <div>
        <p>Upgraded to paid plan</p>
      </div>
    );
  }

  return (
    <div>
      Free trial status:{" "}
      {planStatus === "trialAlmostOver"
        ? "Trial almost over"
        : planStatus === "trialEnded"
        ? "Trial ended"
        : "Trial started"}
      <button
        className={btnClass}
        onClick={() => sendEvent({ type: "upgradedPlan" })}
      >
        Upgrade to paid plan
      </button>
    </div>
  );
}

function InvitationActivity({
  invitationStatus,
  sendEvent,
}: {
  invitationStatus: NestedState<
    StateValue,
    [
      "run",
      "userState",
      "newUser",
      "organizationActivity",
      "createdOrganization",
      "invitationStatus",
    ]
  >;
  sendEvent: (event: Event) => Promise<void>;
}) {
  if (invitationStatus === "noInvites") {
    return (
      <div>
        <button
          className={btnClass}
          onClick={() => sendEvent({ type: "invitedUser" })}
        >
          Invite user
        </button>
      </div>
    );
  }

  if (invitationStatus === "invited") {
    return (
      <div>
        <p>Invited user</p>
        <button
          className={btnClass}
          onClick={() => sendEvent({ type: "acceptedInvitation" })}
        >
          Accept invitation
        </button>
      </div>
    );
  }

  if (invitationStatus === "invitationAccepted") {
    return (
      <div>
        <p>Invitation accepted</p>
      </div>
    );
  }

  return null;
}

function DocumentActivity({
  documentActivityState,
  sendEvent,
}: {
  documentActivityState: NestedState<
    StateValue,
    ["run", "userState", "newUser", "documentActivity"]
  >;
  sendEvent: (event: Event) => Promise<void>;
}) {
  if (documentActivityState === "completedDocument") {
    return (
      <div>
        <p>Performed all document actions</p>
      </div>
    );
  }

  if (documentActivityState === "noDocuments") {
    return (
      <div>
        <button
          className={btnClass}
          onClick={() => sendEvent({ type: "createdDocument" })}
        >
          Create document
        </button>
      </div>
    );
  }

  return (
    <div>
      <SharingStatus
        sharingStatus={documentActivityState?.createdDocument?.sharingStatus}
        sendEvent={sendEvent}
      />
      <PublishingStatus
        publishingStatus={
          documentActivityState?.createdDocument?.publishingStatus
        }
        sendEvent={sendEvent}
      />
    </div>
  );
}

function SharingStatus({
  sharingStatus,
  sendEvent,
}: {
  sharingStatus: NestedState<
    StateValue,
    [
      "run",
      "userState",
      "newUser",
      "documentActivity",
      "createdDocument",
      "sharingStatus",
    ]
  >;
  sendEvent: (event: Event) => Promise<void>;
}) {
  return sharingStatus === "private" ? (
    <div>
      <button
        className={btnClass}
        onClick={() => sendEvent({ type: "sharedDocument" })}
      >
        Share document
      </button>
    </div>
  ) : (
    <div>Document shared</div>
  );
}

function PublishingStatus({
  publishingStatus,
  sendEvent,
}: {
  publishingStatus: NestedState<
    StateValue,
    [
      "run",
      "userState",
      "newUser",
      "documentActivity",
      "createdDocument",
      "publishingStatus",
    ]
  >;
  sendEvent: (event: Event) => Promise<void>;
}) {
  return publishingStatus === "private" ? (
    <div>
      <button
        className={btnClass}
        onClick={() => sendEvent({ type: "publishedDocument" })}
      >
        Publish document
      </button>
    </div>
  ) : (
    <div>Document published</div>
  );
}

async function getStateBackedToken(): Promise<string> {
  const res = await fetch(`${window.origin}/statebacked-token`);
  if (!res.ok) {
    throw new Error("Failed to fetch State Backed token");
  }

  const { token } = await res.json();
  return token;
}

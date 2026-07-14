"use client";

import { useEffect, useState } from "react";

function storageKey(eventId: string): string {
  return `voter_name_${eventId}`;
}

export function useVoterName(eventId: string) {
  const [voterName, setVoterNameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setVoterNameState(localStorage.getItem(storageKey(eventId)));
    setLoaded(true);
  }, [eventId]);

  function setVoterName(name: string) {
    localStorage.setItem(storageKey(eventId), name);
    setVoterNameState(name);
  }

  return { voterName, setVoterName, loaded };
}

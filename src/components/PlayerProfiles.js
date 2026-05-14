import React from "react";

export default function PlayerProfiles({
  currentUser,
  setCurrentUser,
  profiles,
  setProfiles,
}) {
  const addProfile = () => {
    const nextId = profiles.length ? Math.max(...profiles.map((p) => p.id)) + 1 : 1;
    const newProfile = {
      id: nextId,
      name: `Player${nextId}`,
      team: nextId % 2 === 0 ? "blue" : "orange",
      role: "Guesser",
    };
    setProfiles([...profiles, newProfile]);
  };

  const switchProfile = (id) => {
    const found = profiles.find((p) => p.id === id);
    if (found) setCurrentUser(found);
  };

  return (
    <div className="fixed top-4 left-4 bg-black/60 text-white rounded-xl p-3 w-72 text-sm shadow-lg z-50">
      <div className="mb-2 font-bold">Player Profiles</div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {profiles.map((p) => (
          <div
            key={p.id}
            className={`p-2 rounded cursor-pointer flex justify-between ${
              currentUser.id === p.id ? "bg-blue-700" : "bg-gray-800"
            }`}
            onClick={() => switchProfile(p.id)}
          >
            <span>
              {p.name} ({p.team}, {p.role})
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={addProfile}
        className="mt-3 w-full bg-green-600 rounded py-1 text-xs hover:bg-green-700"
      >
        + Add Fake Player
      </button>
    </div>
  );
}

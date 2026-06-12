  const DevRoleTester = () => (
    <div className="fixed top-4 right-4 z-60">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTesterOpen((s) => !s)}
          className="bg-black/70 text-white px-3 py-1 rounded-md border border-gray-700 text-sm shadow"
        >
          {testerOpen ? "Close Tester" : "Tester"}
        </button>
      </div>

      {testerOpen && (
        <div className="mt-2 w-64 bg-black/80 backdrop-blur border border-gray-700 rounded-lg px-3 py-3 shadow-lg text-xs text-white">
          <div className="mb-2 text-sm font-medium">Dev Role Panel</div>

          <label className="block text-[11px] mb-1 text-gray-300">Role</label>
          <select
            value={currentUser.role}
            onChange={(e) =>
              setCurrentUser((u) => ({ ...u, role: e.target.value }))
            }
            className="w-full mb-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-lg"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label className="block text-[11px] mb-1 text-gray-300">Team</label>
          <select
            value={currentUser.team}
            onChange={(e) =>
              setCurrentUser((u) => ({ ...u, team: e.target.value }))
            }
            className="w-full mb-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
          >
            <option value="blue">blue</option>
            <option value="orange">orange</option>
          </select>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() =>
                setCurrentTeam((t) => (t === "blue" ? "orange" : "blue"))
              }
              className="flex-1 bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs"
            >
              Switch Turn → {currentTeam}
            </button>
            <button
              onClick={() => {
                setWords(assignTeamsToWords());
                setBlueScore(9);
                setOrangeScore(8);
                setPhase("Clue Phase");
                setCurrentTeam("blue");
                setClue({ word: "", count: 0 });
                setGuessRemaining(0);
                drawHandledRef.current = false;
              }}
              className="bg-red-700 px-2 py-1 rounded text-xs"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 text-[12px] text-gray-300">
            <div>Role: <b className="text-white">{currentUser.role}</b></div>
            <div>Team: <b className="text-white">{currentUser.team}</b></div>
            <div>Phase: <b className="text-white">{phase}</b></div>
            <div>Guess Remaining: <b className="text-white">{guessRemaining}</b></div>
          </div>
        </div>
      )}
    </div>
  );


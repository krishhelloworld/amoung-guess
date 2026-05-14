import React from "react";

function RoleCard({ role }) {
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg text-center">
      <h3 className="text-lg font-bold">Your Role</h3>
      <p className="text-2xl">{role}</p>
    </div>
  );
}

export default RoleCard;

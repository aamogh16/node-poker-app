import { useGameState } from "@/contexts/GameStateContext";
import { formatDistanceToNow } from "date-fns";

// Remove the local interface since we'll use the one from GameStateContext
export default function JoinRequestsSidebar() {
  const { joinRequests, performAction } = useGameState();

  if (!joinRequests?.length) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 p-4 shadow-lg overflow-y-auto">
      <h2 className="text-white text-lg font-semibold mb-4">Join Requests</h2>
      <div className="space-y-3">
        {joinRequests.map((request) => (
          <div
            key={request.playerId}
            className="bg-gray-800 rounded-lg p-3 text-white"
          >
            <div className="font-medium">{request.playerName}</div>
            <div className="text-sm text-gray-400">
              {formatDistanceToNow(request.timestamp, { addSuffix: true })}
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() =>
                  performAction("approveJoin", undefined, request.playerId)
                }
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-2 rounded transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  performAction("rejectJoin", undefined, request.playerId)
                }
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-2 rounded transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

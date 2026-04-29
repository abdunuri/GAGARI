'use client';

import { useState } from "react";

type TelegramSettingsFormProps = {
  initialBotToken: string;
  initialChatIds: string[];
};

type TelegramSettingsResponse = {
  message: string;
  settings?: {
    botToken: string;
    chatIds: string[];
  };
};

export default function TelegramSettingsForm({ initialBotToken, initialChatIds }: TelegramSettingsFormProps) {
  const [isEditing, setIsEditing] = useState(!initialBotToken && initialChatIds.length === 0);
  const [botToken, setBotToken] = useState(initialBotToken);
  const [chatIds, setChatIds] = useState(initialChatIds.join(", "));
  const [savedBotToken, setSavedBotToken] = useState(initialBotToken);
  const [savedChatIds, setSavedChatIds] = useState(initialChatIds.join(", "));
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCancel = () => {
    setBotToken(savedBotToken);
    setChatIds(savedChatIds);
    setMessage("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/telegram-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botToken,
          chatIds,
        }),
      });
      const data: TelegramSettingsResponse = await response.json();

      if (!response.ok || !data.settings) {
        setMessage(data.message || "Failed to save Telegram settings.");
        return;
      }

      const nextChatIds = data.settings.chatIds.join(", ");
      setBotToken(data.settings.botToken);
      setChatIds(nextChatIds);
      setSavedBotToken(data.settings.botToken);
      setSavedChatIds(nextChatIds);
      setMessage(data.message);
      setIsEditing(false);
    } catch {
      setMessage("Failed to save Telegram settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">Telegram notifications</h2>
          <p className="mt-1 text-sm text-zinc-500">Owner-only order notification settings for this bakery.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 sm:w-auto"
          >
            Edit
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Bot token</span>
          <input
            type="password"
            value={botToken}
            onChange={(event) => setBotToken(event.target.value)}
            disabled={!isEditing || isSaving}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
            placeholder="123456:ABC..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Chat IDs</span>
          <input
            type="text"
            value={chatIds}
            onChange={(event) => setChatIds(event.target.value)}
            disabled={!isEditing || isSaving}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
            placeholder="123456789, -1001234567890"
          />
        </label>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
          {message}
        </p>
      )}

      {isEditing && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Telegram settings"}
          </button>
        </div>
      )}
    </div>
  );
}

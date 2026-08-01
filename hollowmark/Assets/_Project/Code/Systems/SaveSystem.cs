using System;
using System.IO;
using UnityEngine;

namespace Hollowmark.Systems
{
    /// Dead-simple JSON save in persistentDataPath. Grows into slots
    /// and settings later; for the slice it keeps sparks + checkpoint.
    public static class SaveSystem
    {
        [Serializable]
        public class SaveData
        {
            public int sparks;
            public bool hasCheckpoint;
            public float checkpointX;
            public float checkpointY;
            public float checkpointZ;
        }

        private static string FilePath =>
            Path.Combine(Application.persistentDataPath, "hollowmark_save.json");

        public static void Save(SaveData data)
        {
            try
            {
                File.WriteAllText(FilePath, JsonUtility.ToJson(data, prettyPrint: true));
            }
            catch (Exception exception)
            {
                Debug.LogWarning($"SaveSystem: save failed — {exception.Message}");
            }
        }

        public static bool TryLoad(out SaveData data)
        {
            data = null;
            try
            {
                if (!File.Exists(FilePath)) return false;
                data = JsonUtility.FromJson<SaveData>(File.ReadAllText(FilePath));
                return data != null;
            }
            catch (Exception exception)
            {
                Debug.LogWarning($"SaveSystem: load failed — {exception.Message}");
                return false;
            }
        }

        public static void Delete()
        {
            try
            {
                if (File.Exists(FilePath)) File.Delete(FilePath);
            }
            catch (Exception exception)
            {
                Debug.LogWarning($"SaveSystem: delete failed — {exception.Message}");
            }
        }
    }
}

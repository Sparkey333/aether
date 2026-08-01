using System.Collections;
using Hollowmark.Core;
using Hollowmark.Player;
using UnityEngine;

namespace Hollowmark.Systems
{
    /// Session brain: remembers the respawn point, runs the death →
    /// respawn loop, exposes the player transform, and autosaves.
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }
        public static Transform PlayerTransform { get; private set; }

        [SerializeField] private float respawnDelay = 2f;

        private Vector3 respawnPoint;
        private bool hasRespawnPoint;
        private bool defaultCaptured;

        public static GameManager EnsureExists()
        {
            if (Instance != null) return Instance;
            var existing = FindFirstObjectByType<GameManager>();
            if (existing != null) return existing;
            var go = new GameObject("[GameManager]");
            return go.AddComponent<GameManager>();
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (SaveSystem.TryLoad(out SaveSystem.SaveData data))
            {
                SparkWallet.Load(data.sparks);
                if (data.hasCheckpoint)
                {
                    respawnPoint = new Vector3(data.checkpointX, data.checkpointY, data.checkpointZ);
                    hasRespawnPoint = true;
                }
            }
        }

        private void OnEnable()
        {
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
            GameEvents.PlayerDied += HandlePlayerDied;
            GameEvents.CheckpointActivated += HandleCheckpointActivated;
        }

        private void OnDisable()
        {
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
            GameEvents.PlayerDied -= HandlePlayerDied;
            GameEvents.CheckpointActivated -= HandleCheckpointActivated;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
                PlayerTransform = null;
            }
        }

        private void HandlePlayerSpawned(GameObject player)
        {
            if (player == null) return;
            PlayerTransform = player.transform;
            if (!defaultCaptured)
            {
                defaultCaptured = true;
                if (!hasRespawnPoint)
                    respawnPoint = player.transform.position;
            }
        }

        private void HandlePlayerDied()
        {
            StartCoroutine(RespawnAfterDelay());
        }

        private IEnumerator RespawnAfterDelay()
        {
            yield return new WaitForSeconds(respawnDelay);
            var player = FindFirstObjectByType<PlayerController>();
            if (player != null)
                player.Respawn(respawnPoint + Vector3.up * 0.5f);
            else
                Debug.LogWarning("GameManager: no PlayerController found to respawn.");
        }

        private void HandleCheckpointActivated(Vector3 point)
        {
            respawnPoint = point;
            hasRespawnPoint = true;
            SaveSystem.Save(new SaveSystem.SaveData
            {
                sparks = SparkWallet.Total,
                hasCheckpoint = true,
                checkpointX = point.x,
                checkpointY = point.y,
                checkpointZ = point.z,
            });
        }
    }
}

using System;
using UnityEngine;

namespace Hollowmark.Core
{
    /// Static event bus for the handful of cross-system signals.
    /// Subscribers MUST unsubscribe in OnDestroy/OnDisable.
    public static class GameEvents
    {
        public static event Action<GameObject> PlayerSpawned;
        public static event Action PlayerDied;
        public static event Action<GameObject, DamageInfo> EnemyKilled;
        /// (delta, new total)
        public static event Action<int, int> SparksChanged;
        /// World-space respawn point.
        public static event Action<Vector3> CheckpointActivated;
        /// normalized 0..1; raise with 0 (or less) to hide the bar.
        public static event Action<string, float> BossHealthChanged;
        /// Transient center-screen HUD text ("WAVE 2", "CORE: LANCE").
        public static event Action<string> Announce;

        public static void RaisePlayerSpawned(GameObject player) => PlayerSpawned?.Invoke(player);
        public static void RaisePlayerDied() => PlayerDied?.Invoke();
        public static void RaiseEnemyKilled(GameObject enemy, in DamageInfo lastHit) => EnemyKilled?.Invoke(enemy, lastHit);
        public static void RaiseSparksChanged(int delta, int total) => SparksChanged?.Invoke(delta, total);
        public static void RaiseCheckpointActivated(Vector3 respawnPoint) => CheckpointActivated?.Invoke(respawnPoint);
        public static void RaiseBossHealthChanged(string bossName, float normalized) => BossHealthChanged?.Invoke(bossName, normalized);
        public static void RaiseAnnounce(string message) => Announce?.Invoke(message);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ClearOnDomainReloadDisabled()
        {
            PlayerSpawned = null;
            PlayerDied = null;
            EnemyKilled = null;
            SparksChanged = null;
            CheckpointActivated = null;
            BossHealthChanged = null;
            Announce = null;
        }
    }
}

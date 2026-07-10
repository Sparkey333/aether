using System;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Systems
{
    /// Runs one MissionDefinition at a time, counting kills, sparks,
    /// and zone entries off the global event bus.
    public class MissionTracker : MonoBehaviour
    {
        public static MissionTracker Instance { get; private set; }

        [SerializeField, Tooltip("Optional: mission to start automatically.")]
        private MissionDefinition autoStartMission;

        private MissionDefinition current;
        private int objectiveIndex;
        private int progressCount;

        /// (label, current, target) whenever progress ticks.
        public event Action<string, int, int> ObjectiveProgress;
        public event Action<MissionDefinition> MissionCompleted;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void OnEnable()
        {
            GameEvents.EnemyKilled += HandleEnemyKilled;
            GameEvents.SparksChanged += HandleSparksChanged;
        }

        private void OnDisable()
        {
            GameEvents.EnemyKilled -= HandleEnemyKilled;
            GameEvents.SparksChanged -= HandleSparksChanged;
        }

        private void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        private void Start()
        {
            if (autoStartMission != null)
                StartMission(autoStartMission);
        }

        public void StartMission(MissionDefinition mission)
        {
            if (mission == null || mission.objectives.Count == 0)
            {
                Debug.LogWarning("MissionTracker: mission is null or has no objectives.", this);
                return;
            }
            current = mission;
            objectiveIndex = 0;
            progressCount = 0;
            GameEvents.RaiseAnnounce($"MISSION: {mission.title.ToUpperInvariant()}");
            AnnounceObjective();
        }

        public static void NotifyZoneReached(string zoneId)
        {
            if (Instance != null) Instance.HandleZoneReached(zoneId);
        }

        private MissionDefinition.Objective CurrentObjective =>
            current != null && objectiveIndex < current.objectives.Count
                ? current.objectives[objectiveIndex]
                : null;

        private void HandleEnemyKilled(GameObject enemy, DamageInfo lastHit)
        {
            var objective = CurrentObjective;
            if (objective == null || objective.type != ObjectiveType.KillEnemies) return;
            Tick(objective, 1);
        }

        private void HandleSparksChanged(int delta, int total)
        {
            var objective = CurrentObjective;
            if (objective == null || objective.type != ObjectiveType.CollectSparks || delta <= 0) return;
            Tick(objective, delta);
        }

        private void HandleZoneReached(string zoneId)
        {
            var objective = CurrentObjective;
            if (objective == null || objective.type != ObjectiveType.ReachZone) return;
            if (!string.Equals(objective.zoneId, zoneId, StringComparison.OrdinalIgnoreCase)) return;
            CompleteObjective(objective);
        }

        private void Tick(MissionDefinition.Objective objective, int amount)
        {
            progressCount += amount;
            ObjectiveProgress?.Invoke(objective.label, progressCount, objective.targetCount);
            if (progressCount >= objective.targetCount)
                CompleteObjective(objective);
        }

        private void CompleteObjective(MissionDefinition.Objective objective)
        {
            GameEvents.RaiseAnnounce($"OBJECTIVE COMPLETE — {objective.label.ToUpperInvariant()}");
            objectiveIndex++;
            progressCount = 0;

            if (objectiveIndex >= current.objectives.Count)
            {
                GameEvents.RaiseAnnounce($"MISSION COMPLETE — {current.title.ToUpperInvariant()}");
                MissionCompleted?.Invoke(current);
                current = null;
            }
            else
            {
                AnnounceObjective();
            }
        }

        private void AnnounceObjective()
        {
            var objective = CurrentObjective;
            if (objective != null)
                GameEvents.RaiseAnnounce(objective.label.ToUpperInvariant());
        }
    }
}

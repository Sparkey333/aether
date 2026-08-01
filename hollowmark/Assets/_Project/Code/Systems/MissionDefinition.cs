using System;
using System.Collections.Generic;
using UnityEngine;

namespace Hollowmark.Systems
{
    public enum ObjectiveType
    {
        KillEnemies,
        CollectSparks,
        ReachZone,
    }

    /// A linear list of objectives. Deliberately lean — branching,
    /// rewards, and dialogue hooks come with the full mission system.
    [CreateAssetMenu(menuName = "Hollowmark/Mission", fileName = "NewMission")]
    public class MissionDefinition : ScriptableObject
    {
        [Serializable]
        public class Objective
        {
            public ObjectiveType type;
            [Tooltip("Shown in announcements, e.g. 'Clear the arena'.")]
            public string label;
            [Tooltip("Kills or sparks required (ignored for ReachZone).")]
            public int targetCount = 1;
            [Tooltip("Must match a MissionZone's zoneId (ReachZone only).")]
            public string zoneId;
        }

        public string id = "mission";
        public string title = "Mission";
        public List<Objective> objectives = new List<Objective>();
    }
}

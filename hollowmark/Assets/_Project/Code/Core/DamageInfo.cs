using UnityEngine;

namespace Hollowmark.Core
{
    /// Everything a hit needs to carry. Passed by 'in' reference.
    public struct DamageInfo
    {
        public float Amount;
        public GameObject Source;
        public Vector3 Point;
        public Vector3 Normal;
        public Vector3 Knockback;
        public Faction SourceFaction;
        public bool FromHollow;

        public DamageInfo(float amount, GameObject source, Faction sourceFaction)
        {
            Amount = amount;
            Source = source;
            SourceFaction = sourceFaction;
            Point = source != null ? source.transform.position : Vector3.zero;
            Normal = Vector3.up;
            Knockback = Vector3.zero;
            FromHollow = false;
        }
    }
}

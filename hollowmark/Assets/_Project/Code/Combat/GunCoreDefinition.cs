using UnityEngine;

namespace Hollowmark.Combat
{
    public enum FireMode
    {
        Single,
        Auto,
        Charge,
    }

    /// One swappable personality for the Splitfang. Pure data —
    /// the weapon reads these values at fire time.
    [CreateAssetMenu(menuName = "Hollowmark/Gun Core", fileName = "NewGunCore")]
    public class GunCoreDefinition : ScriptableObject
    {
        [Header("Identity")]
        public string id = "core";
        public string displayName = "Core";
        [TextArea] public string description;

        [Header("Firing")]
        public FireMode fireMode = FireMode.Single;
        [Tooltip("Hitscan resolves instantly along a ray; otherwise a projectile is spawned.")]
        public bool hitscan;
        public float damage = 20f;
        [Tooltip("Seconds between shots.")]
        public float fireInterval = 0.5f;
        public float projectileSpeed = 40f;
        [Min(1)] public int pelletsPerShot = 1;
        [Tooltip("Half-angle of the random cone, degrees.")]
        public float spreadDegrees = 0f;
        public float range = 60f;
        public float knockback = 2f;

        [Header("Ammo")]
        [Min(1)] public int maxAmmo = 30;
        [Min(1)] public int ammoPerShot = 1;

        [Header("Chaining (Sunder)")]
        [Tooltip("After a hit, arc to this many additional targets.")]
        public int chainCount = 0;
        public float chainRadius = 8f;

        [Header("Charge (only for FireMode.Charge)")]
        public float maxChargeSeconds = 1.2f;
        [Range(0f, 1f), Tooltip("Damage fraction for an instant tap.")]
        public float minChargeFraction = 0.3f;

        [Header("Presentation")]
        public Color tracerColor = Color.cyan;
    }
}

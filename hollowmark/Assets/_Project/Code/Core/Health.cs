using System;
using UnityEngine;

namespace Hollowmark.Core
{
    /// Universal hit-point pool for player, enemies, and props.
    public class Health : MonoBehaviour, IDamageable
    {
        [Header("Pool")]
        [SerializeField, Tooltip("Hit points at full health.")]
        private float maxHealth = 100f;

        [SerializeField]
        private Faction faction = Faction.Neutral;

        [Header("Mitigation")]
        [SerializeField, Tooltip("Seconds of invulnerability after taking a hit. 0 = none.")]
        private float postHitInvulnerability = 0f;

        private float invulnerableUntil = -1f;

        public float Max => maxHealth;
        public float Current { get; private set; }
        public float Normalized => maxHealth > 0f ? Current / maxHealth : 0f;
        public bool IsDead { get; private set; }
        public Faction Faction => faction;

        /// (current, max) after any change.
        public event Action<float, float> Changed;
        public event Action<DamageInfo> Damaged;
        public event Action<float> Healed;
        public event Action Died;

        private void Awake()
        {
            Current = maxHealth;
        }

        public void TakeDamage(in DamageInfo info)
        {
            if (IsDead) return;
            if (Time.time < invulnerableUntil) return;

            float amount = info.Amount;
            if (faction == Faction.Player)
                amount *= PlayerBuffs.DamageTaken;
            if (amount <= 0f) return;

            Current = Mathf.Max(0f, Current - amount);
            invulnerableUntil = Time.time + postHitInvulnerability;

            Changed?.Invoke(Current, maxHealth);
            Damaged?.Invoke(info);

            if (Current <= 0f)
            {
                IsDead = true;
                Died?.Invoke();
            }
        }

        public void Heal(float amount)
        {
            if (IsDead || amount <= 0f) return;
            float before = Current;
            Current = Mathf.Min(maxHealth, Current + amount);
            if (Mathf.Approximately(before, Current)) return;
            Changed?.Invoke(Current, maxHealth);
            Healed?.Invoke(Current - before);
        }

        public void SetMax(float value, bool refill)
        {
            maxHealth = Mathf.Max(1f, value);
            if (refill) Current = maxHealth;
            Current = Mathf.Min(Current, maxHealth);
            Changed?.Invoke(Current, maxHealth);
        }

        /// Runtime setup for code-spawned entities (e.g. enemies from the
        /// wave spawner), where serialized fields can't be authored.
        public void Configure(Faction newFaction, float newMax)
        {
            faction = newFaction;
            IsDead = false;
            SetMax(newMax, refill: true);
        }

        /// Full restore, clears the dead flag (used on respawn).
        public void ReviveFull()
        {
            IsDead = false;
            Current = maxHealth;
            invulnerableUntil = -1f;
            Changed?.Invoke(Current, maxHealth);
        }
    }
}

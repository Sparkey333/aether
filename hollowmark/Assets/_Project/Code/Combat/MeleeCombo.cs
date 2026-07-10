using System;
using Hollowmark.Core;
using Hollowmark.Player;
using UnityEngine;

namespace Hollowmark.Combat
{
    /// Three-hit melee chain: two quick swings, then a launcher.
    /// Overlap-sphere hits in front of the player; no animation dependency.
    public class MeleeCombo : MonoBehaviour
    {
        [Header("Timing")]
        [SerializeField, Tooltip("Seconds allowed between swings before the chain resets.")]
        private float comboWindow = 0.9f;
        [SerializeField] private float swingCooldown = 0.35f;

        [Header("Hit")]
        [SerializeField] private float baseDamage = 18f;
        [SerializeField] private float hitRadius = 1.6f;
        [SerializeField, Tooltip("Forward offset of the hit sphere center.")]
        private float hitReach = 1.2f;
        [SerializeField] private float knockbackForce = 6f;
        [SerializeField, Tooltip("Upward force added by the third (launcher) hit.")]
        private float launchForce = 8f;
        [SerializeField] private float lungeForce = 4f;

        private InputReader input;
        private PlayerMotor motor;
        private int stage;
        private float lastSwingTime = -99f;
        private float nextSwingTime;

        /// Fires with the 1-based combo stage that just landed.
        public event Action<int> ComboPerformed;

        private void Awake()
        {
            input = InputReader.EnsureExists();
            motor = GetComponent<PlayerMotor>();
        }

        private void OnEnable()
        {
            if (input != null) input.MeleePressed += HandleMeleePressed;
        }

        private void OnDisable()
        {
            if (input != null) input.MeleePressed -= HandleMeleePressed;
        }

        private void HandleMeleePressed()
        {
            if (Time.time < nextSwingTime) return;
            if (motor != null && motor.MoveLocked) return;

            if (Time.time - lastSwingTime > comboWindow)
                stage = 0;

            stage = stage % 3 + 1; // 1, 2, 3, back to 1
            lastSwingTime = Time.time;
            nextSwingTime = Time.time + swingCooldown;

            Swing(stage);
        }

        private void Swing(int comboStage)
        {
            bool launcher = comboStage == 3;
            float damage = baseDamage * (launcher ? 1.6f : 1f) * PlayerBuffs.MeleeDamage;

            if (motor != null)
                motor.AddImpulse(transform.forward * lungeForce);

            Vector3 center = transform.position + transform.forward * hitReach + Vector3.up * 1f;
            var colliders = Physics.OverlapSphere(center, hitRadius,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);

            var hitRoots = new System.Collections.Generic.HashSet<Transform>();
            foreach (var collider in colliders)
            {
                Transform root = collider.transform.root;
                if (root == transform.root || hitRoots.Contains(root)) continue;

                var damageable = collider.GetComponentInParent<IDamageable>();
                if (damageable == null || damageable.IsDead || damageable.Faction == Faction.Player) continue;
                hitRoots.Add(root);

                Vector3 away = (collider.bounds.center - transform.position);
                away.y = 0f;
                away = away.sqrMagnitude > 0.001f ? away.normalized : transform.forward;
                Vector3 knockback = away * knockbackForce + (launcher ? Vector3.up * launchForce : Vector3.zero);

                var info = new DamageInfo(damage, gameObject, Faction.Player)
                {
                    Point = collider.bounds.center,
                    Normal = -away,
                    Knockback = knockback,
                };
                damageable.TakeDamage(info);
            }

            ComboPerformed?.Invoke(comboStage);
        }
    }
}

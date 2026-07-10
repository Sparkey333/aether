using System;
using System.Collections;
using Hollowmark.Core;
using Hollowmark.Player;
using UnityEngine;

namespace Hollowmark.Hollow
{
    /// The dark transformation. Kills feed the Hollow meter; transforming
    /// buys speed, melee power, and damage resistance while the meter
    /// drains — but corruption climbs, and maxing it costs you control.
    public class HollowFormController : MonoBehaviour
    {
        [Header("Meter")]
        [SerializeField] private float meterMax = 100f;
        [SerializeField, Tooltip("Meter gained per enemy killed.")]
        private float gainPerKill = 8f;
        [SerializeField, Tooltip("Meter drained per second while transformed.")]
        private float drainPerSecond = 6f;
        [SerializeField, Tooltip("Minimum meter required to transform.")]
        private float minToTransform = 50f;

        [Header("Buffs while transformed")]
        [SerializeField] private float moveSpeedMultiplier = 1.35f;
        [SerializeField] private float meleeDamageMultiplier = 2f;
        [SerializeField] private float damageTakenMultiplier = 0.5f;

        [Header("Corruption")]
        [SerializeField] private float corruptionMax = 100f;
        [SerializeField] private float corruptionRisePerSecond = 10f;
        [SerializeField] private float corruptionDecayPerSecond = 5f;
        [SerializeField, Tooltip("Seconds of lost control when corruption maxes out.")]
        private float loseControlSeconds = 1.5f;

        [Header("Presentation")]
        [SerializeField] private Color hollowTint = new Color(0.35f, 0.1f, 0.5f);

        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");

        private InputReader input;
        private PlayerMotor motor;
        private Renderer[] renderers;
        private MaterialPropertyBlock propertyBlock;
        private float meter;
        private float corruption;
        private Coroutine staggerRoutine;

        public bool IsTransformed { get; private set; }

        public event Action<bool> TransformedChanged;
        public event Action<float, float> MeterChanged;
        public event Action<float, float> CorruptionChanged;

        private void Awake()
        {
            input = InputReader.EnsureExists();
            motor = GetComponent<PlayerMotor>();
            renderers = GetComponentsInChildren<Renderer>();
            propertyBlock = new MaterialPropertyBlock();
        }

        private void OnEnable()
        {
            if (input != null) input.TransformPressed += HandleTransformPressed;
            GameEvents.EnemyKilled += HandleEnemyKilled;
            GameEvents.PlayerDied += HandlePlayerDied;
        }

        private void OnDisable()
        {
            if (input != null) input.TransformPressed -= HandleTransformPressed;
            GameEvents.EnemyKilled -= HandleEnemyKilled;
            GameEvents.PlayerDied -= HandlePlayerDied;
            if (IsTransformed) ExitForm();
        }

        private void HandlePlayerDied() => ExitForm();

        private void HandleEnemyKilled(GameObject enemy, DamageInfo lastHit)
        {
            AddHollow(gainPerKill);
        }

        /// Also called by future Hollow Vyre pickups.
        public void AddHollow(float amount)
        {
            meter = Mathf.Clamp(meter + amount, 0f, meterMax);
            MeterChanged?.Invoke(meter, meterMax);
        }

        private void HandleTransformPressed()
        {
            if (IsTransformed)
            {
                ExitForm();
            }
            else if (meter >= minToTransform && staggerRoutine == null)
            {
                EnterForm();
            }
            else if (!IsTransformed)
            {
                GameEvents.RaiseAnnounce("HOLLOW METER LOW");
            }
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            if (IsTransformed)
            {
                meter = Mathf.Max(0f, meter - drainPerSecond * dt);
                MeterChanged?.Invoke(meter, meterMax);

                corruption = Mathf.Min(corruptionMax, corruption + corruptionRisePerSecond * dt);
                CorruptionChanged?.Invoke(corruption, corruptionMax);

                // Pulse to sell the wrongness.
                float pulse = 1f + Mathf.Sin(Time.time * 8f) * 0.04f;
                transform.localScale = Vector3.one * pulse;

                if (corruption >= corruptionMax)
                {
                    LoseControl();
                }
                else if (meter <= 0f)
                {
                    ExitForm();
                }
            }
            else if (corruption > 0f)
            {
                corruption = Mathf.Max(0f, corruption - corruptionDecayPerSecond * dt);
                CorruptionChanged?.Invoke(corruption, corruptionMax);
            }
        }

        private void EnterForm()
        {
            IsTransformed = true;
            PlayerBuffs.MoveSpeed = moveSpeedMultiplier;
            PlayerBuffs.MeleeDamage = meleeDamageMultiplier;
            PlayerBuffs.DamageTaken = damageTakenMultiplier;
            ApplyTint(true);
            GameEvents.RaiseAnnounce("HOLLOW FORM");
            TransformedChanged?.Invoke(true);
        }

        private void ExitForm()
        {
            if (!IsTransformed) return;
            IsTransformed = false;
            PlayerBuffs.ResetAll();
            ApplyTint(false);
            transform.localScale = Vector3.one;
            TransformedChanged?.Invoke(false);
        }

        private void LoseControl()
        {
            ExitForm();
            meter = 0f;
            corruption = 0f;
            MeterChanged?.Invoke(meter, meterMax);
            CorruptionChanged?.Invoke(corruption, corruptionMax);
            GameEvents.RaiseAnnounce("LOST CONTROL");
            if (staggerRoutine != null) StopCoroutine(staggerRoutine);
            staggerRoutine = StartCoroutine(StaggerRoutine());
        }

        private IEnumerator StaggerRoutine()
        {
            if (motor != null) motor.MoveLocked = true;
            yield return new WaitForSeconds(loseControlSeconds);
            if (motor != null) motor.MoveLocked = false;
            staggerRoutine = null;
        }

        private void ApplyTint(bool on)
        {
            if (renderers == null) return;
            foreach (var rendererItem in renderers)
            {
                if (rendererItem == null) continue;
                if (on)
                {
                    rendererItem.GetPropertyBlock(propertyBlock);
                    propertyBlock.SetColor(BaseColorId, hollowTint);
                    rendererItem.SetPropertyBlock(propertyBlock);
                }
                else
                {
                    rendererItem.SetPropertyBlock(null);
                }
            }
        }

        private void OnDestroy()
        {
            if (IsTransformed) PlayerBuffs.ResetAll();
        }
    }
}

using System;
using System.Collections.Generic;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Combat
{
    /// The modular Warden sidearm. Holds a list of GunCoreDefinitions,
    /// tracks per-core ammo, and fires in the current core's mode.
    /// Aim direction is the camera's forward; origin is the muzzle.
    public class Splitfang : MonoBehaviour
    {
        [SerializeField, Tooltip("Assign the four cores; order = swap order.")]
        private List<GunCoreDefinition> cores = new List<GunCoreDefinition>();
        [SerializeField, Tooltip("Optional; auto-created as a child if empty.")]
        private Transform muzzle;

        private readonly Dictionary<GunCoreDefinition, int> ammo = new Dictionary<GunCoreDefinition, int>();
        private InputReader input;
        private Camera cachedCamera;
        private int index;
        private float nextFireTime;
        private bool charging;
        private float chargeStart;
        private float nextEmptyAnnounce;

        public GunCoreDefinition CurrentCore =>
            cores.Count > 0 ? cores[Mathf.Clamp(index, 0, cores.Count - 1)] : null;

        public event Action<GunCoreDefinition> CoreChanged;
        /// (current, max) for the active core.
        public event Action<int, int> AmmoChanged;

        private void Awake()
        {
            input = InputReader.EnsureExists();

            if (muzzle == null)
            {
                var muzzleGo = new GameObject("Muzzle");
                muzzleGo.transform.SetParent(transform, false);
                muzzleGo.transform.localPosition = new Vector3(0.35f, 1.2f, 0.6f);
                muzzle = muzzleGo.transform;
            }

            foreach (var core in cores)
            {
                if (core != null && !ammo.ContainsKey(core))
                    ammo[core] = core.maxAmmo;
            }
            if (cores.Count == 0)
                Debug.LogWarning("Splitfang: no gun cores assigned — the weapon is inert.", this);
        }

        private void OnEnable()
        {
            if (input == null) return;
            input.FirePressed += HandleFirePressed;
            input.FireReleased += HandleFireReleased;
            input.SwapCore += HandleSwapCore;
        }

        private void OnDisable()
        {
            if (input == null) return;
            input.FirePressed -= HandleFirePressed;
            input.FireReleased -= HandleFireReleased;
            input.SwapCore -= HandleSwapCore;
        }

        private void Start()
        {
            var core = CurrentCore;
            if (core != null)
            {
                CoreChanged?.Invoke(core);
                AmmoChanged?.Invoke(GetAmmo(core), core.maxAmmo);
            }
        }

        private void Update()
        {
            var core = CurrentCore;
            if (core != null && core.fireMode == FireMode.Auto && input != null && input.FireHeld)
                TryFire(1f);
        }

        private void HandleFirePressed()
        {
            var core = CurrentCore;
            if (core == null) return;
            switch (core.fireMode)
            {
                case FireMode.Single:
                case FireMode.Auto:
                    TryFire(1f);
                    break;
                case FireMode.Charge:
                    charging = true;
                    chargeStart = Time.time;
                    break;
            }
        }

        private void HandleFireReleased()
        {
            var core = CurrentCore;
            if (core == null || !charging) return;
            charging = false;
            if (core.fireMode != FireMode.Charge) return;
            float fraction = Mathf.Clamp01((Time.time - chargeStart) / Mathf.Max(0.01f, core.maxChargeSeconds));
            TryFire(Mathf.Max(core.minChargeFraction, fraction));
        }

        private void HandleSwapCore(int direction)
        {
            if (cores.Count < 2) return;
            index = (index + direction % cores.Count + cores.Count) % cores.Count;
            charging = false;
            nextFireTime = Mathf.Max(nextFireTime, Time.time + 0.15f);
            var core = CurrentCore;
            if (core == null) return;
            CoreChanged?.Invoke(core);
            AmmoChanged?.Invoke(GetAmmo(core), core.maxAmmo);
            GameEvents.RaiseAnnounce($"CORE: {core.displayName.ToUpperInvariant()}");
        }

        private void TryFire(float power)
        {
            var core = CurrentCore;
            if (core == null || Time.time < nextFireTime) return;

            int current = GetAmmo(core);
            if (current < core.ammoPerShot)
            {
                if (Time.time >= nextEmptyAnnounce)
                {
                    GameEvents.RaiseAnnounce("CORE EMPTY");
                    nextEmptyAnnounce = Time.time + 1.5f;
                }
                return;
            }

            nextFireTime = Time.time + core.fireInterval;
            ammo[core] = current - core.ammoPerShot;
            AmmoChanged?.Invoke(ammo[core], core.maxAmmo);

            Vector3 baseDirection = AimDirection();
            float damage = core.damage * PlayerBuffs.GunDamage * power;

            for (int i = 0; i < core.pelletsPerShot; i++)
            {
                Vector3 direction = ApplySpread(baseDirection, core.spreadDegrees);
                if (core.hitscan)
                    FireRay(direction, core, damage);
                else
                    Projectile.Spawn(muzzle.position, direction, transform.root, Faction.Player,
                        damage, core.projectileSpeed * Mathf.Max(0.5f, power), core.range,
                        core.knockback, core.chainCount, core.chainRadius, core.tracerColor);
            }
        }

        private Vector3 AimDirection()
        {
            if (cachedCamera == null) cachedCamera = Camera.main;
            return cachedCamera != null ? cachedCamera.transform.forward : transform.forward;
        }

        private static Vector3 ApplySpread(Vector3 direction, float spreadDegrees)
        {
            if (spreadDegrees <= 0f) return direction;
            Vector2 offset = UnityEngine.Random.insideUnitCircle * spreadDegrees;
            return Quaternion.LookRotation(direction) * Quaternion.Euler(offset.y, offset.x, 0f) * Vector3.forward;
        }

        private void FireRay(Vector3 direction, GunCoreDefinition core, float damage)
        {
            Vector3 origin = muzzle.position;
            Vector3 end = origin + direction * core.range;

            var hits = Physics.RaycastAll(origin, direction, core.range,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);
            Array.Sort(hits, (a, b) => a.distance.CompareTo(b.distance));

            foreach (var hit in hits)
            {
                if (hit.collider.transform.root == transform.root) continue;
                end = hit.point;

                var damageable = hit.collider.GetComponentInParent<IDamageable>();
                if (damageable != null && !damageable.IsDead && damageable.Faction != Faction.Player)
                {
                    var info = new DamageInfo(damage, gameObject, Faction.Player)
                    {
                        Point = hit.point,
                        Normal = hit.normal,
                        Knockback = direction * core.knockback,
                    };
                    damageable.TakeDamage(info);
                }
                break;
            }

            SpawnTracer(origin, end, core.tracerColor);
        }

        /// Quick LineRenderer flash between two points; self-destructs.
        public static void SpawnTracer(Vector3 from, Vector3 to, Color color)
        {
            var go = new GameObject("Tracer");
            var line = go.AddComponent<LineRenderer>();
            line.useWorldSpace = true;
            line.positionCount = 2;
            line.SetPosition(0, from);
            line.SetPosition(1, to);
            line.widthMultiplier = 0.06f;

            var shader = Shader.Find("Universal Render Pipeline/Unlit");
            if (shader != null)
            {
                var material = new Material(shader);
                material.SetColor("_BaseColor", color);
                line.material = material;
            }
            line.startColor = color;
            line.endColor = color;
            Destroy(go, 0.12f);
        }

        public int GetAmmo(GunCoreDefinition core) =>
            core != null && ammo.TryGetValue(core, out int value) ? value : 0;

        public void RefillAll()
        {
            foreach (var core in cores)
            {
                if (core != null) ammo[core] = core.maxAmmo;
            }
            var current = CurrentCore;
            if (current != null)
                AmmoChanged?.Invoke(GetAmmo(current), current.maxAmmo);
        }
    }
}

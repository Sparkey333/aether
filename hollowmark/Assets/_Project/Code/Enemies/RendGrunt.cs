using System.Collections;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Enemies
{
    /// Basic Rend melee unit: idle until it sees the player, chases,
    /// telegraphs, swipes. No NavMesh — direct steering with gravity,
    /// which is all the greybox arena needs.
    [RequireComponent(typeof(CharacterController))]
    [RequireComponent(typeof(Health))]
    public class RendGrunt : MonoBehaviour
    {
        private enum State { Idle, Chase, Attack, Staggered, Dead }

        [Header("Senses")]
        [SerializeField] private float detectRange = 15f;

        [Header("Movement")]
        [SerializeField] private float moveSpeed = 4.5f;
        [SerializeField] private float turnSpeed = 480f;

        [Header("Attack")]
        [SerializeField] private float attackRange = 1.8f;
        [SerializeField] private float attackDamage = 12f;
        [SerializeField, Tooltip("Telegraph time before the swipe lands.")]
        private float windupSeconds = 0.4f;
        [SerializeField] private float attackCooldown = 1.2f;

        [Header("Drops")]
        [SerializeField] private int sparkDrops = 3;

        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");

        private CharacterController cc;
        private Health health;
        private Transform player;
        private State state = State.Idle;
        private float verticalVelocity;
        private float nextAttackTime;
        private float stateUntil;
        private DamageInfo lastHit;
        private Renderer[] renderers;
        private MaterialPropertyBlock propertyBlock;

        /// Builds a grunt from primitives at runtime (used by the spawner).
        public static RendGrunt Spawn(Vector3 position)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            go.name = "RendGrunt";
            go.transform.position = position + Vector3.up * 1.1f;

            var meshCollider = go.GetComponent<Collider>();
            if (meshCollider != null) Destroy(meshCollider); // CharacterController replaces it

            var renderer = go.GetComponent<Renderer>();
            if (renderer != null)
                renderer.material.SetColor(BaseColorId, new Color(0.45f, 0.2f, 0.12f));

            // Glowing core — the Rend tell.
            var core = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            core.name = "Core";
            var coreCollider = core.GetComponent<Collider>();
            if (coreCollider != null) Destroy(coreCollider);
            core.transform.SetParent(go.transform, false);
            core.transform.localPosition = new Vector3(0f, 0.25f, 0.35f);
            core.transform.localScale = Vector3.one * 0.3f;
            var coreRenderer = core.GetComponent<Renderer>();
            if (coreRenderer != null)
                coreRenderer.material.SetColor(BaseColorId, new Color(0.2f, 1f, 0.9f));

            var grunt = go.AddComponent<RendGrunt>();
            grunt.health.Configure(Faction.Rend, 40f);
            return grunt;
        }

        private void Awake()
        {
            cc = GetComponent<CharacterController>();
            health = GetComponent<Health>();
            renderers = GetComponentsInChildren<Renderer>();
            propertyBlock = new MaterialPropertyBlock();

            health.Damaged += HandleDamaged;
            health.Died += HandleDied;
        }

        private void OnEnable()
        {
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
        }

        private void OnDisable()
        {
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
        }

        private void OnDestroy()
        {
            if (health != null)
            {
                health.Damaged -= HandleDamaged;
                health.Died -= HandleDied;
            }
        }

        private void Start()
        {
            if (player == null)
            {
                var found = FindFirstObjectByType<Hollowmark.Player.PlayerController>();
                if (found != null) player = found.transform;
            }
        }

        private void HandlePlayerSpawned(GameObject playerGo)
        {
            if (playerGo != null) player = playerGo.transform;
        }

        private void Update()
        {
            if (state == State.Dead) return;
            ApplyGravity();
            if (player == null) return;

            float distance = Vector3.Distance(transform.position, player.position);

            switch (state)
            {
                case State.Idle:
                    if (distance <= detectRange && HasLineOfSight())
                        state = State.Chase;
                    break;

                case State.Chase:
                    FacePlayer();
                    if (distance <= attackRange)
                    {
                        if (Time.time >= nextAttackTime)
                        {
                            state = State.Attack;
                            stateUntil = Time.time + windupSeconds;
                            Flash(new Color(1f, 0.3f, 0.2f));
                        }
                    }
                    else
                    {
                        MoveToward(player.position);
                    }
                    break;

                case State.Attack:
                    FacePlayer();
                    if (Time.time >= stateUntil)
                    {
                        Swipe();
                        nextAttackTime = Time.time + attackCooldown;
                        state = State.Chase;
                        ClearFlash();
                    }
                    break;

                case State.Staggered:
                    if (Time.time >= stateUntil)
                    {
                        ClearFlash();
                        state = State.Chase;
                    }
                    break;
            }
        }

        private void ApplyGravity()
        {
            if (!cc.enabled) return;
            verticalVelocity = cc.isGrounded ? -2f : Mathf.Max(-40f, verticalVelocity - 30f * Time.deltaTime);
            cc.Move(Vector3.up * verticalVelocity * Time.deltaTime);
        }

        private void MoveToward(Vector3 target)
        {
            if (!cc.enabled) return;
            Vector3 direction = target - transform.position;
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.01f) return;
            cc.Move(direction.normalized * moveSpeed * Time.deltaTime);
        }

        private void FacePlayer()
        {
            Vector3 direction = player.position - transform.position;
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.01f) return;
            Quaternion target = Quaternion.LookRotation(direction, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, target, turnSpeed * Time.deltaTime);
        }

        private bool HasLineOfSight()
        {
            Vector3 eye = transform.position + Vector3.up * 0.5f;
            Vector3 targetPoint = player.position + Vector3.up * 1f;
            Vector3 direction = targetPoint - eye;

            var hits = Physics.RaycastAll(eye, direction.normalized, direction.magnitude,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);
            float bestDistance = float.MaxValue;
            Transform bestRoot = null;
            foreach (var hit in hits)
            {
                Transform root = hit.collider.transform.root;
                if (root == transform.root) continue;
                if (hit.distance < bestDistance)
                {
                    bestDistance = hit.distance;
                    bestRoot = root;
                }
            }
            return bestRoot == null || bestRoot == player.root;
        }

        private void Swipe()
        {
            if (player == null) return;
            float distance = Vector3.Distance(transform.position, player.position);
            if (distance > attackRange + 0.8f) return; // player dodged out

            var damageable = player.GetComponentInParent<IDamageable>();
            if (damageable == null || damageable.IsDead) return;

            Vector3 away = player.position - transform.position;
            away.y = 0f;
            away = away.sqrMagnitude > 0.001f ? away.normalized : transform.forward;

            var info = new DamageInfo(attackDamage, gameObject, Faction.Rend)
            {
                Point = player.position,
                Normal = -away,
                Knockback = away * 5f,
            };
            damageable.TakeDamage(info);
        }

        private void HandleDamaged(DamageInfo info)
        {
            lastHit = info;
            if (state == State.Dead) return;
            state = State.Staggered;
            stateUntil = Time.time + 0.3f;
            Flash(Color.white);
            if (player == null && info.Source != null)
                player = info.Source.transform; // retaliate at the shooter
        }

        private void HandleDied()
        {
            if (state == State.Dead) return;
            state = State.Dead;
            GameEvents.RaiseEnemyKilled(gameObject, lastHit);

            for (int i = 0; i < sparkDrops; i++)
            {
                Vector3 offset = new Vector3(
                    (i - sparkDrops * 0.5f) * 0.4f, 0.5f, ((i * 7) % 3 - 1) * 0.4f);
                Hollowmark.Systems.SparkPickup.CreateAt(transform.position + offset, 1);
            }

            if (cc != null) cc.enabled = false;
            StartCoroutine(SinkAndDespawn());
        }

        private IEnumerator SinkAndDespawn()
        {
            float elapsed = 0f;
            while (elapsed < 2f)
            {
                elapsed += Time.deltaTime;
                transform.position += Vector3.down * 0.6f * Time.deltaTime;
                yield return null;
            }
            Destroy(gameObject);
        }

        private void Flash(Color color)
        {
            if (renderers == null) return;
            foreach (var rendererItem in renderers)
            {
                if (rendererItem == null) continue;
                rendererItem.GetPropertyBlock(propertyBlock);
                propertyBlock.SetColor(BaseColorId, color);
                rendererItem.SetPropertyBlock(propertyBlock);
            }
        }

        private void ClearFlash()
        {
            if (renderers == null) return;
            foreach (var rendererItem in renderers)
            {
                if (rendererItem == null) continue;
                rendererItem.SetPropertyBlock(null);
            }
        }
    }
}

using System.Collections.Generic;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Combat
{
    /// Player-weapon projectile: manual sweep (no rigidbody), damage on the
    /// first non-owner hit, optional Sunder-style chaining to nearby targets.
    public class Projectile : MonoBehaviour
    {
        private const float SweepRadius = 0.12f;

        private Vector3 direction;
        private float speed;
        private float damage;
        private float range;
        private float knockback;
        private int chainCount;
        private float chainRadius;
        private Color color;
        private Faction sourceFaction;
        private Transform ownerRoot;
        private HashSet<Transform> alreadyHit;
        private float traveled;
        private float dieAt;

        public static Projectile Spawn(Vector3 origin, Vector3 direction, Transform ownerRoot,
            Faction sourceFaction, float damage, float speed, float range, float knockback,
            int chainCount, float chainRadius, Color color, HashSet<Transform> alreadyHit = null)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            go.name = "Projectile";
            go.transform.localScale = Vector3.one * 0.18f;
            go.transform.position = origin + direction * 0.2f;

            var collider = go.GetComponent<Collider>();
            if (collider != null) Destroy(collider); // swept manually

            var renderer = go.GetComponent<Renderer>();
            if (renderer != null)
            {
                var shader = Shader.Find("Universal Render Pipeline/Unlit");
                if (shader == null) shader = Shader.Find("Universal Render Pipeline/Lit");
                if (shader != null)
                {
                    var material = new Material(shader);
                    material.SetColor("_BaseColor", color);
                    renderer.material = material;
                }
            }

            var projectile = go.AddComponent<Projectile>();
            projectile.direction = direction.normalized;
            projectile.speed = speed;
            projectile.damage = damage;
            projectile.range = range;
            projectile.knockback = knockback;
            projectile.chainCount = chainCount;
            projectile.chainRadius = chainRadius;
            projectile.color = color;
            projectile.sourceFaction = sourceFaction;
            projectile.ownerRoot = ownerRoot;
            projectile.alreadyHit = alreadyHit ?? new HashSet<Transform>();
            projectile.dieAt = Time.time + 4f;
            return projectile;
        }

        private void Update()
        {
            if (Time.time > dieAt)
            {
                Destroy(gameObject);
                return;
            }

            float step = speed * Time.deltaTime;
            var hits = Physics.SphereCastAll(transform.position, SweepRadius, direction,
                step + 0.05f, Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);

            RaycastHit best = default;
            bool found = false;
            float bestDistance = float.MaxValue;
            foreach (var hit in hits)
            {
                Transform root = hit.collider.transform.root;
                if (root == transform.root) continue; // own collider until Destroy lands
                if (ownerRoot != null && root == ownerRoot) continue;
                if (alreadyHit.Contains(root)) continue;
                if (hit.distance < bestDistance)
                {
                    bestDistance = hit.distance;
                    best = hit;
                    found = true;
                }
            }

            if (found)
            {
                Impact(best);
                return;
            }

            transform.position += direction * step;
            traveled += step;
            if (traveled >= range)
                Destroy(gameObject);
        }

        private void Impact(RaycastHit hit)
        {
            Transform root = hit.collider.transform.root;
            alreadyHit.Add(root);

            var damageable = hit.collider.GetComponentInParent<IDamageable>();
            if (damageable != null && !damageable.IsDead && damageable.Faction != sourceFaction)
            {
                var info = new DamageInfo(damage, ownerRoot != null ? ownerRoot.gameObject : gameObject, sourceFaction)
                {
                    Point = hit.point,
                    Normal = hit.normal,
                    Knockback = direction * knockback,
                };
                damageable.TakeDamage(info);

                if (chainCount > 0)
                    TryChain(hit.point);
            }

            Destroy(gameObject);
        }

        private void TryChain(Vector3 from)
        {
            var candidates = Physics.OverlapSphere(from, chainRadius,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);

            Transform bestRoot = null;
            Vector3 bestPoint = default;
            float bestSqr = float.MaxValue;
            foreach (var candidate in candidates)
            {
                Transform root = candidate.transform.root;
                if (alreadyHit.Contains(root)) continue;
                if (ownerRoot != null && root == ownerRoot) continue;
                var damageable = candidate.GetComponentInParent<IDamageable>();
                if (damageable == null || damageable.IsDead || damageable.Faction == sourceFaction) continue;

                float sqr = (candidate.bounds.center - from).sqrMagnitude;
                if (sqr < bestSqr)
                {
                    bestSqr = sqr;
                    bestRoot = root;
                    bestPoint = candidate.bounds.center;
                }
            }

            if (bestRoot == null) return;
            Vector3 toNext = (bestPoint - from).normalized;
            Spawn(from, toNext, ownerRoot, sourceFaction, damage * 0.8f, speed, chainRadius * 1.5f,
                knockback, chainCount - 1, chainRadius, color, alreadyHit);
        }
    }
}

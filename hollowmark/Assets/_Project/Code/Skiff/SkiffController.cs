using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Skiff
{
    /// Rigidbody hoverboard: four spring-damped hover points, thrust and
    /// yaw steering, boost, and a hop. Only responds to input while a
    /// SkiffMount has put the player aboard.
    [RequireComponent(typeof(Rigidbody))]
    public class SkiffController : MonoBehaviour
    {
        [Header("Hover")]
        [SerializeField, Tooltip("Target ride height above ground, meters.")]
        private float hoverHeight = 0.8f;
        [SerializeField] private float springStrength = 90f;
        [SerializeField] private float springDamper = 8f;
        [SerializeField, Tooltip("Local corner offsets for the four hover rays.")]
        private Vector3[] hoverPoints =
        {
            new Vector3(0.45f, 0f, 0.9f),
            new Vector3(-0.45f, 0f, 0.9f),
            new Vector3(0.45f, 0f, -0.9f),
            new Vector3(-0.45f, 0f, -0.9f),
        };

        [Header("Drive")]
        [SerializeField] private float thrustForce = 45f;
        [SerializeField] private float steerTorque = 6f;
        [SerializeField] private float maxSpeed = 22f;

        [Header("Tricks")]
        [SerializeField] private float boostVelocity = 8f;
        [SerializeField] private float boostCooldown = 2f;
        [SerializeField] private float jumpVelocity = 6f;

        [Header("Stability")]
        [SerializeField] private float uprightTorque = 12f;

        private Rigidbody rb;
        private InputReader input;
        private int groundedCorners;
        private float nextBoostTime;

        /// Set by SkiffMount while the player is aboard.
        public bool IsMounted { get; set; }

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.mass = 90f;
            rb.linearDamping = 0.4f;
            rb.angularDamping = 3f;
            rb.interpolation = RigidbodyInterpolation.Interpolate;
            rb.collisionDetectionMode = CollisionDetectionMode.Continuous;
            input = InputReader.EnsureExists();
        }

        private void OnEnable()
        {
            if (input == null) return;
            input.DashPressed += HandleBoost;
            input.JumpPressed += HandleJump;
        }

        private void OnDisable()
        {
            if (input == null) return;
            input.DashPressed -= HandleBoost;
            input.JumpPressed -= HandleJump;
        }

        private void FixedUpdate()
        {
            Hover();
            KeepUpright();

            if (IsMounted && input != null)
            {
                Vector2 move = input.Move;
                Vector3 forward = transform.forward;
                forward.y = 0f;
                forward.Normalize();

                rb.AddForce(forward * (move.y * thrustForce), ForceMode.Acceleration);
                rb.AddTorque(Vector3.up * (move.x * steerTorque), ForceMode.Acceleration);
            }

            // Soft horizontal speed cap; boosts decay back naturally.
            Vector3 velocity = rb.linearVelocity;
            Vector3 horizontal = new Vector3(velocity.x, 0f, velocity.z);
            if (horizontal.magnitude > maxSpeed)
            {
                Vector3 capped = horizontal.normalized * Mathf.Lerp(horizontal.magnitude, maxSpeed, 0.1f);
                rb.linearVelocity = new Vector3(capped.x, velocity.y, capped.z);
            }
        }

        private void Hover()
        {
            groundedCorners = 0;
            foreach (Vector3 local in hoverPoints)
            {
                Vector3 point = transform.TransformPoint(local);
                Vector3 origin = point + Vector3.up * 0.5f;
                float castDistance = hoverHeight + 1.5f;

                if (Physics.Raycast(origin, Vector3.down, out RaycastHit hit, castDistance,
                        Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                {
                    if (hit.collider.transform.root == transform.root) continue;
                    groundedCorners++;

                    float height = hit.distance - 0.5f; // remove the origin lift
                    float compression = 1f - Mathf.Clamp01(height / hoverHeight);
                    float pointVelocityY = rb.GetPointVelocity(point).y;
                    float force = compression * springStrength - pointVelocityY * springDamper;
                    if (force > 0f)
                        rb.AddForceAtPosition(Vector3.up * force, point, ForceMode.Acceleration);
                }
            }
        }

        private void KeepUpright()
        {
            Vector3 torque = Vector3.Cross(transform.up, Vector3.up) * uprightTorque;
            rb.AddTorque(torque, ForceMode.Acceleration);
        }

        public bool IsHovering => groundedCorners >= 2;

        private void HandleBoost()
        {
            if (!IsMounted || Time.time < nextBoostTime) return;
            nextBoostTime = Time.time + boostCooldown;
            Vector3 forward = transform.forward;
            forward.y = 0f;
            rb.AddForce(forward.normalized * boostVelocity, ForceMode.VelocityChange);
        }

        private void HandleJump()
        {
            if (!IsMounted || !IsHovering) return;
            rb.AddForce(Vector3.up * jumpVelocity, ForceMode.VelocityChange);
        }
    }
}

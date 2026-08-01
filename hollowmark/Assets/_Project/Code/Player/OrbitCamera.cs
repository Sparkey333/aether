using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Player
{
    /// Hand-rolled third-person orbit camera with collision pull-in.
    /// Lives on the Main Camera. Acquires the player automatically via
    /// GameEvents.PlayerSpawned; the Skiff retargets it while mounted.
    public class OrbitCamera : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform target;
        [SerializeField, Tooltip("Focus point relative to the target (roughly head height).")]
        private Vector3 focusOffset = new Vector3(0f, 1.5f, 0f);

        [Header("Orbit")]
        [SerializeField, Tooltip("Degrees per pixel of mouse delta.")]
        private float mouseSensitivity = 0.12f;
        [SerializeField, Tooltip("Degrees per second at full stick deflection.")]
        private float stickSpeed = 180f;
        [SerializeField] private float distance = 5.5f;
        [SerializeField] private float minPitch = -40f;
        [SerializeField] private float maxPitch = 70f;

        [Header("Feel")]
        [SerializeField, Tooltip("Higher = snappier follow of the focus point.")]
        private float followSharpness = 12f;
        [SerializeField] private float collisionRadius = 0.25f;

        private InputReader input;
        private float yaw;
        private float pitch = 15f;
        private Vector3 focusPoint;

        private void Awake()
        {
            input = InputReader.EnsureExists();
        }

        private void OnEnable()
        {
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
        }

        private void OnDisable()
        {
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
        }

        private void Start()
        {
            if (target == null)
            {
                var player = FindFirstObjectByType<PlayerController>();
                if (player != null) SetTarget(player.transform);
                else Debug.LogWarning("OrbitCamera: no target and no PlayerController found yet.", this);
            }
        }

        private void HandlePlayerSpawned(GameObject player)
        {
            if (player != null) SetTarget(player.transform);
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
            if (target != null)
            {
                focusPoint = target.position + focusOffset;
                yaw = target.eulerAngles.y;
            }
        }

        private void LateUpdate()
        {
            if (target == null || input == null) return;
            float dt = Time.deltaTime;

            yaw += input.Look.x * mouseSensitivity + input.LookStick.x * stickSpeed * dt;
            pitch -= input.Look.y * mouseSensitivity + input.LookStick.y * stickSpeed * dt;
            pitch = Mathf.Clamp(pitch, minPitch, maxPitch);

            // Exponential smoothing that's framerate-independent.
            float t = 1f - Mathf.Exp(-followSharpness * dt);
            focusPoint = Vector3.Lerp(focusPoint, target.position + focusOffset, t);

            Quaternion rotation = Quaternion.Euler(pitch, yaw, 0f);
            Vector3 back = rotation * Vector3.back;
            float pulledDistance = distance;

            if (Physics.SphereCast(focusPoint, collisionRadius, back, out RaycastHit hit,
                    distance, Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
            {
                if (target == null || !hit.collider.transform.IsChildOf(target.root))
                    pulledDistance = Mathf.Max(0.5f, hit.distance);
            }

            transform.SetPositionAndRotation(focusPoint + back * pulledDistance, rotation);
        }
    }
}

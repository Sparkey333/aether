using System;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Player
{
    /// CharacterController-driven movement: accel/decel, air control,
    /// variable-height jump, double jump, coyote time, jump buffering,
    /// dash, and external knockback impulses. Input comes in world space
    /// via SetMoveInput; PlayerController owns the camera-relative mapping.
    [RequireComponent(typeof(CharacterController))]
    public class PlayerMotor : MonoBehaviour
    {
        [Header("Ground movement")]
        [SerializeField, Tooltip("Top run speed in m/s (before buffs).")]
        private float maxSpeed = 8f;
        [SerializeField] private float acceleration = 60f;
        [SerializeField] private float deceleration = 70f;
        [SerializeField, Tooltip("Degrees per second the body turns toward travel.")]
        private float turnSpeed = 720f;

        [Header("Air")]
        [SerializeField, Range(0f, 1f), Tooltip("Fraction of ground accel available airborne.")]
        private float airControl = 0.5f;
        [SerializeField] private float gravity = -30f;
        [SerializeField] private float terminalVelocity = -40f;

        [Header("Jumping")]
        [SerializeField, Tooltip("Apex height of a full-hold jump, meters.")]
        private float jumpHeight = 2.2f;
        [SerializeField] private float doubleJumpHeight = 1.8f;
        [SerializeField, Tooltip("Grace window to jump after walking off a ledge.")]
        private float coyoteTime = 0.12f;
        [SerializeField, Tooltip("How early a jump press is remembered before landing.")]
        private float jumpBuffer = 0.12f;
        [SerializeField, Range(0f, 1f), Tooltip("Upward velocity kept when jump is released early.")]
        private float jumpCutMultiplier = 0.5f;

        [Header("Dash")]
        [SerializeField] private float dashSpeed = 20f;
        [SerializeField] private float dashDuration = 0.15f;
        [SerializeField] private float dashCooldown = 0.6f;

        private CharacterController cc;
        private Vector3 horizontalVelocity;
        private float verticalVelocity;
        private Vector3 moveInput;
        private Vector3 impulse;
        private bool wasGrounded;
        private float lastGroundedTime = -99f;
        private float lastJumpPressedTime = -99f;
        private bool doubleJumpAvailable;
        private bool airDashAvailable;
        private float dashEndTime = -99f;
        private float nextDashTime = -99f;
        private Vector3 dashDirection;

        public bool IsGrounded { get; private set; }
        public bool IsDashing => Time.time < dashEndTime;
        public Vector3 Velocity => horizontalVelocity + impulse + Vector3.up * verticalVelocity;
        /// Freezes movement (death, stagger, skiff riding). Gravity still applies.
        public bool MoveLocked { get; set; }

        public event Action Jumped;
        public event Action DoubleJumped;
        public event Action Landed;
        public event Action DashStarted;

        private void Awake()
        {
            cc = GetComponent<CharacterController>();
        }

        /// World-space direction, magnitude clamped to 1. Y is ignored.
        public void SetMoveInput(Vector3 worldDirection)
        {
            worldDirection.y = 0f;
            moveInput = Vector3.ClampMagnitude(worldDirection, 1f);
        }

        public void OnJumpPressed() => lastJumpPressedTime = Time.time;

        public void OnJumpReleased()
        {
            if (verticalVelocity > 0f && !IsDashing)
                verticalVelocity *= jumpCutMultiplier;
        }

        public void TryDash()
        {
            if (MoveLocked || IsDashing || Time.time < nextDashTime) return;
            if (!IsGrounded && !airDashAvailable) return;

            dashDirection = moveInput.sqrMagnitude > 0.01f ? moveInput.normalized : FlatForward();
            dashEndTime = Time.time + dashDuration;
            nextDashTime = Time.time + dashCooldown;
            if (!IsGrounded) airDashAvailable = false;
            verticalVelocity = 0f;
            DashStarted?.Invoke();
        }

        public void AddImpulse(Vector3 force)
        {
            impulse += new Vector3(force.x, 0f, force.z);
            if (force.y > 0f)
                verticalVelocity = Mathf.Max(verticalVelocity, 0f) + force.y;
        }

        /// Safe teleport: CharacterController must be disabled to warp.
        public void Teleport(Vector3 position)
        {
            bool wasEnabled = cc.enabled;
            cc.enabled = false;
            transform.position = position;
            cc.enabled = wasEnabled;
            horizontalVelocity = Vector3.zero;
            verticalVelocity = 0f;
            impulse = Vector3.zero;
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            if (dt <= 0f || !cc.enabled) return;

            IsGrounded = cc.isGrounded;
            if (IsGrounded)
            {
                lastGroundedTime = Time.time;
                doubleJumpAvailable = true;
                airDashAvailable = true;
                if (!wasGrounded) Landed?.Invoke();
                if (verticalVelocity < 0f) verticalVelocity = -2f; // stick to ground
            }
            wasGrounded = IsGrounded;

            if (Time.time - lastJumpPressedTime <= jumpBuffer)
                TryConsumeJump();

            Vector3 input = MoveLocked ? Vector3.zero : moveInput;
            Vector3 targetVelocity = input * (maxSpeed * PlayerBuffs.MoveSpeed);
            float rate = (targetVelocity.sqrMagnitude > horizontalVelocity.sqrMagnitude ? acceleration : deceleration)
                         * (IsGrounded ? 1f : airControl);
            horizontalVelocity = Vector3.MoveTowards(horizontalVelocity, targetVelocity, rate * dt);

            if (IsDashing)
            {
                horizontalVelocity = dashDirection * dashSpeed;
                verticalVelocity = 0f;
            }
            else
            {
                verticalVelocity = Mathf.Max(terminalVelocity, verticalVelocity + gravity * dt);
            }

            impulse = Vector3.MoveTowards(impulse, Vector3.zero, (IsGrounded ? 30f : 8f) * dt);

            Vector3 motion = (horizontalVelocity + impulse + Vector3.up * verticalVelocity) * dt;
            cc.Move(motion);

            Vector3 face = IsDashing ? dashDirection : input;
            if (!MoveLocked && face.sqrMagnitude > 0.01f)
            {
                Quaternion target = Quaternion.LookRotation(face, Vector3.up);
                transform.rotation = Quaternion.RotateTowards(transform.rotation, target, turnSpeed * dt);
            }
        }

        private void TryConsumeJump()
        {
            if (MoveLocked || IsDashing) return;

            bool groundJump = IsGrounded || Time.time - lastGroundedTime <= coyoteTime;
            if (groundJump)
            {
                verticalVelocity = Mathf.Sqrt(2f * -gravity * jumpHeight);
                lastJumpPressedTime = -99f;
                lastGroundedTime = -99f;
                Jumped?.Invoke();
            }
            else if (doubleJumpAvailable)
            {
                doubleJumpAvailable = false;
                verticalVelocity = Mathf.Sqrt(2f * -gravity * doubleJumpHeight);
                lastJumpPressedTime = -99f;
                DoubleJumped?.Invoke();
            }
        }

        private Vector3 FlatForward()
        {
            Vector3 f = transform.forward;
            f.y = 0f;
            return f.sqrMagnitude > 0.001f ? f.normalized : Vector3.forward;
        }
    }
}

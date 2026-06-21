// =====================================================================
// ThirdThumb Rig — parametric servo clamp (Tier 3)
// A printable bracket that grips a controller edge and holds two SG90
// micro-servos so their horns tap the A and B face buttons.
//
// Render an STL:   openscad -o clamp.stl clamp.scad
// Tune the numbers below to your controller, then re-export. KISS:
// everything that varies between controllers lives in PARAMETERS.
// Units: millimetres. Print: PLA/PETG, 0.2mm layers, 3 perimeters, 20% infill.
// =====================================================================

/* [PARAMETERS] */
// --- controller fit ---
shell_thickness = 22;     // how thick the controller is where the clamp grips
lip_grip        = 9;      // how far the jaw wraps over the front/back faces
button_spacing  = 24;     // centre-to-centre distance between A and B buttons
reach           = 28;     // how far the servos sit above the clamp base

// --- build quality ---
wall            = 3;      // structural wall thickness
base_w          = 70;     // width of the base plate
clearance       = 0.4;    // printer fit clearance for the servo pocket

// --- SG90 micro-servo (typical) ---
sg90_body  = [23.0, 12.5, 22.5];   // L x W x H of the body pocket
sg90_tab_l = 32.0;                 // length across the mounting tabs
sg90_tab_t = 2.5;                  // tab thickness
sg90_hole_spacing = 28.0;          // screw-hole centres
sg90_hole_d = 2.0;

$fn = 48;

// ---------------------------------------------------------------------
module servo_pocket() {
    // hollow body pocket + the tab ledge the servo flange rests on
    union() {
        cube([sg90_body[0]+clearance, sg90_body[1]+clearance, sg90_body[2]+2], center=true);
        // mounting screw holes through the tab ledge
        for (s=[-1,1])
            translate([s*sg90_hole_spacing/2, 0, sg90_body[2]/2])
                cylinder(h=sg90_tab_t*3, d=sg90_hole_d, center=true);
    }
}

module servo_mount() {
    // a block with the body pocket subtracted, open at the bottom for the horn
    difference() {
        cube([sg90_tab_l+2*wall, sg90_body[1]+2*wall, sg90_body[2]+wall], center=true);
        translate([0,0,wall/2]) servo_pocket();
        // window for the horn / output shaft to reach down to the button
        translate([0,0,-sg90_body[2]/2-wall]) cube([10,10,wall*3], center=true);
    }
}

module clamp_jaw() {
    // C-shaped jaw that hooks over the controller's top edge
    difference() {
        cube([base_w, shell_thickness+2*wall, lip_grip+wall]);
        translate([wall, wall, -1])
            cube([base_w-2*wall, shell_thickness, lip_grip+wall+2]);
    }
}

module base_plate() {
    cube([base_w, sg90_body[1]+2*wall+6, wall]);
}

// ---------------------------------------------------------------------
// ASSEMBLY
module rig() {
    // base
    base_plate();
    // jaw under the base, gripping the controller
    translate([0, -(shell_thickness+2*wall), 0]) clamp_jaw();
    // two servo mounts raised above the base, centred over A and B
    for (s=[-1,1])
        translate([base_w/2 + s*button_spacing/2,
                   (sg90_body[1]+2*wall+6)/2,
                   reach])
            servo_mount();
    // support posts from base to each mount
    for (s=[-1,1])
        translate([base_w/2 + s*button_spacing/2 - wall,
                   (sg90_body[1]+2*wall+6)/2 - wall, wall])
            cube([2*wall, 2*wall, reach - sg90_body[2]/2]);
}

rig();

use cucumber::{given, World as _};

#[derive(Clone, Debug, Default, cucumber::World)]
#[world(init = Self::new)]
pub struct World {
    modeler: tlm::Modeler,
}

impl World {
    fn new() -> World {
        World {
            modeler: tlm::Modeler::new()
        }
    }
}

#[given(regex = "^an empty type-link model is set up$")]
fn empty_model(world: &mut World) {
    world.modeler.initialize();
}

fn main() {
    futures::executor::block_on(World::run(
        "../tlm-tests/features",
    ));
}

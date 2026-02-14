use cucumber::{given, writer, World as _};

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
fn given_empty_model(world: &mut World) {
    world.modeler.initialize();
}

#[given(regex = "^the namespace ([^ ]+) exists with uri ([^ ]+)$")]
fn given_namespace(world: &mut World, ns: String, uri: String) {
    world.modeler.add_namespace(ns, uri, None);
}

#[given(regex = "^the namespace ([^ ]+) is the active namespace$")]
fn given_active_namespace(world: &mut World, ns: String) {
    world.modeler.set_active_namespace(Some(ns));
}

fn main() {
    futures::executor::block_on(
        World::cucumber()
            .with_writer(writer::Libtest::or_basic())
            .run(
                "../tlm-tests/features",
            )
    );
}
